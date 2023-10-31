import { Framework } from '../src/framework';
declare let tests: {
    framework: (autoStart?: boolean) => Promise<Framework>;
    bundle: (namespace: any, autoStart?: boolean) => Promise<any>;
    factory: () => Promise<{
        bundle: (namespace: any, autoStart?: boolean) => Promise<any>;
        framework: (noStart?: boolean) => Promise<any>;
        events: () => any;
        reg: () => any;
    }>;
};
export default tests;
