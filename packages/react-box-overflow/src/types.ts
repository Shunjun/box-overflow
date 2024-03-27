/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-03-26 11:22:59
 */

export type DataType<Key extends keyof any> = {
  [K in Key]: any
} & { [K: keyof any]: any }
