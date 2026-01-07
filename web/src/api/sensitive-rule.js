import request from "../common/request";
import Api from "./api";

class SensitiveRuleApi extends Api{
    constructor() {
        super("sensitive-rule");
    }

    changeOwner = async (id, owner) => {
        let result = await request.post(`/${this.group}/${id}/change-owner?owner=${owner}`);
        return result['code'] === 1;
    }
    importCommand = async (file) => {
        const formData = new FormData();
        formData.append("file", file,);
        let result = await request.post(`/${this.group}/import`, formData, {'Content-Type': 'multipart/form-data'});
        if (result.code !== 1) {
            return [false, result.message];
        }
        return [true, result['data']];
    }
 
    changeStatus = async (id, status) => {
        let result = await request.patch(`/${this.group}/${id}/status?status=${status}`);
        return result['code'] !== 1;
    }

    copy = async (id) => {
        let result = await request.post(`/${this.group}/${id}/copy`);
        return result['code'] !== 1;
    }
 
}

let sensitiveRuleApi = new SensitiveRuleApi();
export default sensitiveRuleApi;