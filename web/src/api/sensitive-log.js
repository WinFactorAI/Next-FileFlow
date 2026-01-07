import request from "../common/request";
import Api from "./api";

class SensitiveLogApi extends Api{
    constructor() {
        super("sensitive-log");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }

    clear  = async () => {
        let result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }

    clearByType  = async (type) => {
        let result = await request.post(`/${this.group}/${type}/clear`);
        return result['code'] === 1;
    }
    getByBatchId = async (batchId) => {
        let result = await request.get(`/${this.group}/${batchId}/batch-id`);
        return result['data'];
    }
}

let sensitiveLogApi = new SensitiveLogApi();
export default sensitiveLogApi;