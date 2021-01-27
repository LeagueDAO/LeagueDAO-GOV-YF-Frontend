import React from 'react';
import cx from 'classnames';

import s from './styles.module.scss';

export type SupportedFlow = 'row' | 'col';
export type SupportedAlign = 'start' | 'center' | 'end';
export type SupportedJustify = 'start' | 'center' | 'end' | 'space-between';

export type GridProps = {
  className?: string;
  flow?: SupportedFlow;
  rowsTemplate?: string;
  colsTemplate?: string;
  align?: SupportedAlign;
  justify?: SupportedJustify;
  gap?: number | [number, number];
  wrap?: boolean;
  padding?: number | number[];
};

const Grid: React.FunctionComponent<GridProps> = props => {
  const {
    className,
    flow,
    gap,
    rowsTemplate,
    colsTemplate,
    align,
    justify,
    wrap,
    padding,
    children,
  } = props;

  const [rowGap = 0, columnGap = rowGap] = ([] as number[]).concat(gap ?? 0);

  const [
    paddingTop,
    paddingRight = paddingTop,
    paddingBottom = paddingTop,
    paddingLeft = paddingRight,
  ] = ([] as number[]).concat(padding ?? 0);

  return (
    <div
      className={cx(
        s.grid,
        flow && s[flow],
        align && s[`align-${align}`],
        justify && s[`justify-${justify}`],
        wrap && 'text-wrap',
        className,
      )}
      style={{
        gridTemplateRows: rowsTemplate,
        gridTemplateColumns: colsTemplate,
        rowGap: rowGap > 0 ? rowGap : undefined,
        columnGap: columnGap > 0 ? columnGap : undefined,
        paddingTop: paddingTop > 0 ? paddingTop : undefined,
        paddingRight: paddingRight > 0 ? paddingRight : undefined,
        paddingBottom: paddingBottom > 0 ? paddingBottom : undefined,
        paddingLeft: paddingLeft > 0 ? paddingLeft : undefined,
      }}>
      {children}
    </div>
  );
};

export default Grid;