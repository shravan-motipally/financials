import * as React from 'react';
import Typography from '@mui/material/Typography';

interface TitleProps {
  children?: React.ReactNode;
}

export default function Subtitle(props: TitleProps) {
  return (
    <Typography component="h4" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}