import request from "../common/request";
import Api from "./api";

class HeartLogApi extends Api{
    constructor() {
        super("heart-logs");
    }

    Clear = async () => {
        const result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }
}

let heartLogApi = new HeartLogApi();
export default heartLogApi;