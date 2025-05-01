export function getBid(req: any) {
    const xid = req.header('X-CS571-ID');
    if (xid) {
        return xid;
    } else {
        return undefined;
    }
}