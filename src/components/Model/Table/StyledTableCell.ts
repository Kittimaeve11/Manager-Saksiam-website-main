// components/table/StyledTableCell.ts
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#1c2439' : theme.palette.primary.lighter,
    color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.primary.main,
    fontSize: theme.typography.h6.fontSize,
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 400,
    verticalAlign: 'top',
  },
}));

export default StyledTableCell;