import { RastroJS } from './rastrojs';

const { track } = new RastroJS();

export = {
    track,
    RastroJS,
    isValidOrderCode: RastroJS.isValidOrderCode,
};
