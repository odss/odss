import { Framework } from './framework';
export declare function boot({ properties, bundles }?: {
    properties: {};
    bundles: any[];
}, runAsync?: boolean): Promise<Framework>;
export declare function asyncRunner(framework: Framework, bundles: string[]): Promise<void>;
export declare function syncRunner(framework: Framework, bundles: string[]): Promise<void>;
