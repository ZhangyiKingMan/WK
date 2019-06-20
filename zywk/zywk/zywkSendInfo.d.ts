declare module "zywk" {
    import * as http from 'http';
    type REQ = http.IncomingMessage;
    type RES = http.ServerResponse;
    export interface sendInfo {
        req?: http.IncomingMessage;
        res?: http.ServerResponse;
    }
}

