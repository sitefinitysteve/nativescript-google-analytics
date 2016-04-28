export interface InitalizeOptions {
    dispatchInterval?:number;
    logging?: boolean;
    trackingId: string;
}

export interface LogEventOptions {
    action: string;
    category: string;
    label?: string;
    value?: number;
}

export interface LogExceptionOptions {
    description: string;
    fatal?: boolean;
}

export interface StartTimerOptions {
    category: string,
    label?: string;
    name?: string;
}

export interface LogTimingEventOptions {
    category: string,
    label?: string;
    name?: string;
    value: number;
}

export function initalize(options: InitalizeOptions): void;
export function logEvent(options: LogEventOptions): void;
export function logView(viewName: string): void;
export function dispatch(): void;
export function logException(options: LogExceptionOptions): void;
export function logException(description: string): void;
export function startTimer(timerName: string, options: StartTimerOptions): void;
export function stopTimer(timerName: string): void;
export function logTimingEvent(options: LogTimingEventOptions): void;
export function getTracker(): string;
