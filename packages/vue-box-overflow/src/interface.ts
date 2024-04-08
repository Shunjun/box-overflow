/**
 * @author        shunzi <tobyzsj@gmail.com>
 * @date          2024-04-02 17:52:25
 */
import type { BoxOverflowOptions } from 'box-overflow-core'

export interface BoxOverflowProps extends Omit<BoxOverflowOptions, 'getContainer'> {
  component?: string
}
