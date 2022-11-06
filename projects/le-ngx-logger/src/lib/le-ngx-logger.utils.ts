import { LeNgxLoggerConfig } from "./le-ngx-logger.model"
import { LE_NGX_SERVICE_DEFAULT_CONFIG as defaultConfig, } from './le-ngx-logger.config'


export function removeCycles<T>(o: T, depth = 100, truncationMarker: any = undefined): T {
    const cache: any[] = []
    return recur(o, depth, cache)
    function recur(o: T, depth: number, cache: any[]): any {
        if (!depth) return undefined
        if (!o || typeof o !== 'object') return o
        if (cache.includes(o)) return truncationMarker; else cache.push(o)
        if (Array.isArray(o)) return o.map(e => recur(e, depth - 1, cache))
        return Object.fromEntries(Object.entries(o).map(([key, value]) => [key, recur(value, depth - 1, cache)]))
    }
}

export function mergeProps<T extends object>(source: T, optionalProps?: PartialDeep<T>, depth = Infinity): T {
    if (depth < 0) return source
    if (!source || Array.isArray(source) && Array.isArray(optionalProps)) {
        return optionalProps as T
    } else if (source && typeof source === 'object' && optionalProps && typeof optionalProps === 'object') {
        return Object.fromEntries(
            Object.entries(source).map(([key, value]) => [key, mergeProps(value, optionalProps?.[key as keyof T] as any, depth - 1)])
        ) as T
    } else {
        return optionalProps === undefined ? source : optionalProps as T
    }
}

export function leNgxLoggerIsOn(devMode: boolean, config?: LeNgxLoggerConfig) {
    return true ||
        devMode && (config?.report?.onDev ?? defaultConfig.report.onDev) ||
        !devMode && (config?.report?.onProd ?? defaultConfig.report.onProd)
}

// export type PartialDeep<T> = {
//     [key in keyof T]?: PartialDeep<T[key]>
// }

export type PartialDeep<T> = {
    [key in keyof T]?: T[key] | PartialDeep<T[key]>
}
