import React from 'react';
import classNames from 'classnames';

type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
};

export const HStack: React.FC<StackProps> = ({
  gap = 8,
  align = 'center',
  justify = 'start',
  className,
  style,
  children,
  ...rest
}) => {
  const cls = classNames(
    'flex flex-row',
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
      'items-baseline': align === 'baseline',
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
    },
    className,
  );

  return (
    <div
      {...rest}
      className={cls}
      style={{ gap, ...style }}
    >
      {children}
    </div>
  );
};

export const VStack: React.FC<StackProps> = ({
  gap = 8,
  align = 'stretch',
  justify = 'start',
  className,
  style,
  children,
  ...rest
}) => {
  const cls = classNames(
    'flex flex-col',
    {
      'items-start': align === 'start',
      'items-center': align === 'center',
      'items-end': align === 'end',
      'items-stretch': align === 'stretch',
      'items-baseline': align === 'baseline',
      'justify-start': justify === 'start',
      'justify-center': justify === 'center',
      'justify-end': justify === 'end',
      'justify-between': justify === 'between',
      'justify-around': justify === 'around',
      'justify-evenly': justify === 'evenly',
    },
    className,
  );

  return (
    <div
      {...rest}
      className={cls}
      style={{ gap, ...style }}
    >
      {children}
    </div>
  );
};

export default { HStack, VStack };


