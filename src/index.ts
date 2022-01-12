import { RastroJS } from './rastrojs';

export = {
    RastroJS,
    get track() {
        const instance = new RastroJS();
        return instance.track.bind(instance);
    },
    isValidOrderCode: RastroJS.isValidOrderCode,
};
