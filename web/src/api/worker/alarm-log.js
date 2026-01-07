import request from "../../common/request";
import Api from "../api";


class AlarmLogApi extends Api{
    constructor() {
        super("worker/alarm-logs");
    }

    Clear = async (id) => {
        const result = await request.post(`/${this.group}/${id}/clear`);
        return result['code'] === 1;
    }
}

let alarmLogApi = new AlarmLogApi();
export default alarmLogApi;