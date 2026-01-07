import request from "../common/request";
import Api from "./api";

class FileLogApi extends Api{
    constructor() {
        super("file-logs");
    }

    Clear = async () => {
        const result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }
}

let fileLogApi = new FileLogApi();
export default fileLogApi;