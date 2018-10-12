declare class EventSchema {
    define (topic:string, schema:object):void
    emit (topic:string, payload:any):void
    off (topic:string, handler:Function):void
    on (topic:string, handler:Function):void
    once (topic:string, handler:Function):void
}

export default EventSchema