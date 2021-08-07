// https://github.com/mrdoob/three.js/blob/master/examples/js/loaders/TTFLoader.js
// FIXME: Convert to TypeScript
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import * as THREE from "three";
import opentype from "opentype.js";

export class TTFLoader extends THREE.Loader {
  constructor(manager) {
    super(manager);
    this.reversed = false;
  }

  load(url, onLoad, onProgress, onError) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this;
    const loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType("arraybuffer");
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(
      url,
      function (buffer) {
        try {
          onLoad(scope.parse(buffer));
        } catch (e) {
          if (onError) {
            onError(e);
          } else {
            // eslint-disable-next-line no-undef
            console.error(e);
          }

          scope.manager.itemError(url);
        }
      },
      onProgress,
      onError
    );
  }

  parse(arraybuffer) {
    function convert(font, reversed) {
      const round = Math.round;
      const glyphs = {};
      const scale = 100000 / ((font.unitsPerEm || 2048) * 72);
      const glyphIndexMap = font.encoding.cmap.glyphIndexMap;
      const unicodes = Object.keys(glyphIndexMap);

      for (let i = 0; i < unicodes.length; i++) {
        const unicode = unicodes[i];
        const glyph = font.glyphs.glyphs[glyphIndexMap[unicode]];

        if (unicode !== undefined) {
          const token = {
            ha: round(glyph.advanceWidth * scale),
            x_min: round(glyph.xMin * scale),
            x_max: round(glyph.xMax * scale),
            o: "",
          };

          if (reversed) {
            glyph.path.commands = reverseCommands(glyph.path.commands);
          }

          glyph.path.commands.forEach(function (command) {
            if (command.type.toLowerCase() === "c") {
              command.type = "b";
            }

            token.o += command.type.toLowerCase() + " ";

            if (command.x !== undefined && command.y !== undefined) {
              token.o +=
                round(command.x * scale) + " " + round(command.y * scale) + " ";
            }

            if (command.x1 !== undefined && command.y1 !== undefined) {
              token.o +=
                round(command.x1 * scale) +
                " " +
                round(command.y1 * scale) +
                " ";
            }

            if (command.x2 !== undefined && command.y2 !== undefined) {
              token.o +=
                round(command.x2 * scale) +
                " " +
                round(command.y2 * scale) +
                " ";
            }
          });
          glyphs[String.fromCodePoint(glyph.unicode)] = token;
        }
      }

      return {
        glyphs: glyphs,
        familyName: font.getEnglishName("fullName"),
        ascender: round(font.ascender * scale),
        descender: round(font.descender * scale),
        underlinePosition: font.tables.post.underlinePosition,
        underlineThickness: font.tables.post.underlineThickness,
        boundingBox: {
          xMin: font.tables.head.xMin,
          xMax: font.tables.head.xMax,
          yMin: font.tables.head.yMin,
          yMax: font.tables.head.yMax,
        },
        resolution: 1000,
        original_font_information: font.tables.name,
      };
    }

    function reverseCommands(commands) {
      const paths = [];
      let path;
      commands.forEach(function (c) {
        if (c.type.toLowerCase() === "m") {
          path = [c];
          paths.push(path);
        } else if (c.type.toLowerCase() !== "z") {
          path.push(c);
        }
      });
      const reversed = [];
      paths.forEach(function (p) {
        const result = {
          type: "m",
          x: p[p.length - 1].x,
          y: p[p.length - 1].y,
        };
        reversed.push(result);

        for (let i = p.length - 1; i > 0; i--) {
          const command = p[i];
          const result = {
            type: command.type,
          };

          if (command.x2 !== undefined && command.y2 !== undefined) {
            result.x1 = command.x2;
            result.y1 = command.y2;
            result.x2 = command.x1;
            result.y2 = command.y1;
          } else if (command.x1 !== undefined && command.y1 !== undefined) {
            result.x1 = command.x1;
            result.y1 = command.y1;
          }

          result.x = p[i - 1].x;
          result.y = p[i - 1].y;
          reversed.push(result);
        }
      });
      return reversed;
    }

    return convert(opentype.parse(arraybuffer), this.reversed); // eslint-disable-line no-undef
  }
}
