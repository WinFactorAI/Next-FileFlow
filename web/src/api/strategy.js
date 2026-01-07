import qs from "qs";
import request from "../common/request";
import Api from "./api";
class StrategyApi extends Api {
    constructor() {
        super("strategies");
    }

    GetAll = async () => {
        let result = await request.get(`/${this.group}`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }
    Bind = async (id, data) => {
        const result = await request.post(`/${this.group}/${id}/bind`, data);
        return result['code'] === 1;
    }

    Unbind = async (id, data) => {
        const result = await request.post(`/${this.group}/${id}/unbind`, data);
        return result['code'] === 1;
    }

    GetUserPagingByForbiddenCommandId = async (id, params) => {
        let paramsStr = qs.stringify(params);
        let result = await request.get(`/${this.group}/${id}/users/paging?${paramsStr}`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }

    GetUserIdByStrategyPolicyId = async (id) => {
        let result = await request.get(`/${this.group}/${id}/users/id`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }
}

const strategyApi = new StrategyApi();
export default strategyApi;