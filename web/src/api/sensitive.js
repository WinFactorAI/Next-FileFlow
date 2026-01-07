import request from "../common/request";
import Api from "./api";
class SensitiveApi extends Api{
    constructor() {
        super("sensitive");
    }
    start = async () => {
        let result = await request.get(`/${this.group}/start`);
        return result['code'] === 1;
    }
    stop = async () => {
        let result = await request.get(`/${this.group}/stop`);
        return result['code'] === 1;
    }
    status = async () => {
        let result = await request.get(`/${this.group}/status`);
        return result['data'] ;
    }
    
}

let sensitiveApi = new SensitiveApi();
export default sensitiveApi;