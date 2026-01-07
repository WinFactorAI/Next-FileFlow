import request from "../common/request";
import Api from "./api";

class DeviceApi extends Api{
    constructor() {
        super("device");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
    getCode = async () => {
        let result = await request.get(`/${this.group}/get-code`);
        return result['data'];
    }
}

let deviceApi = new DeviceApi();
export default deviceApi;