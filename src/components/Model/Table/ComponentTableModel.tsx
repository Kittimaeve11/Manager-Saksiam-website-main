import React from 'react'
import type { Column } from '../../../utils/types';
import { Table, TableBody, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import StyledTableCell from './StyledTableCell';

interface ComponentTableModelProp {
  columns: Column[];
  children: React.ReactNode;
  largest?: string;
}

const ComponentTableModel: React.FC<ComponentTableModelProp> = ({ columns, children, largest }) => {
  const theme = useTheme();
    return (
  <TableContainer sx={{ overflowX: 'auto', borderRadius: { xs: 0, md: 2 }, border: '2px solid', borderColor:theme.palette.mode === 'dark'? '#1c2439': theme.palette.secondary.lighter }}>
      <Table sx={{ minWidth: largest, }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.grey[300], borderRadius: '12px' }}>
            {columns.map((col) => (
              <StyledTableCell
                key={col.id}
                align={col.align || 'left'}
                sx={{ width: col.width, whiteSpace: 'nowrap' }}
              >
                {col.label}
              </StyledTableCell>

            ))}
          </TableRow>
        </TableHead>
        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  )
}

export default ComponentTableModel
