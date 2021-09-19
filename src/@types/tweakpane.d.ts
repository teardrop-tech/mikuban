import { View } from "@tweakpane/core/dist/cjs/common/view/view";
import { BladeController } from "@tweakpane/core/dist/cjs/blade/common/controller/blade";

declare module "tweakpane" {
  export declare class BladeApi<C extends BladeController<View>> {
    /**
     * @hidden
     */
    readonly controller_: C;
    /**
     * @hidden
     */
    constructor(controller: C);
    get disabled(): boolean;
    set disabled(disabled: boolean);
    get hidden(): boolean;
    set hidden(hidden: boolean);
    get pages(): TabPageApi[];
    dispose(): void;

    public on(eventName: string, handler: (ev: any) => void): this;
  }
}
