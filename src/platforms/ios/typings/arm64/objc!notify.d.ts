
declare function notify_cancel(token: number): number;

declare function notify_check(token: number, check: interop.Pointer | interop.Reference<number>): number;

declare function notify_get_state(token: number, state64: interop.Pointer | interop.Reference<number>): number;

declare function notify_is_valid_token(val: number): boolean;

declare function notify_post(name: string): number;

declare function notify_register_check(name: string, out_token: interop.Pointer | interop.Reference<number>): number;

declare function notify_register_dispatch(name: string, out_token: interop.Pointer | interop.Reference<number>, queue: NSObject, handler: (p1: number) => void): number;

declare function notify_register_file_descriptor(name: string, notify_fd: interop.Pointer | interop.Reference<number>, flags: number, out_token: interop.Pointer | interop.Reference<number>): number;

declare function notify_register_mach_port(name: string, notify_port: interop.Pointer | interop.Reference<number>, flags: number, out_token: interop.Pointer | interop.Reference<number>): number;

declare function notify_register_signal(name: string, sig: number, out_token: interop.Pointer | interop.Reference<number>): number;

declare function notify_resume(token: number): number;

declare function notify_set_state(token: number, state64: number): number;

declare function notify_suspend(token: number): number;