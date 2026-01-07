import request from "../common/request";
import Api from "./api";

class AlarmLogApi extends Api{
    constructor() {
        super("alarm-logs");
    }

    Clear = async () => {
        const result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }
}

let alarmLogApi = new AlarmLogApi();
export default alarmLogApi;