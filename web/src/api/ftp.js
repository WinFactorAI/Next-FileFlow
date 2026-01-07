import request from "../common/request";
import Api from "./api";
class FtpApi extends Api{
    constructor() {
        super("ftp");
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

let ftpApi = new FtpApi();
export default ftpApi;