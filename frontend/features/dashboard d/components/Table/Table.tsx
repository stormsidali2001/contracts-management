import styles from './Table.module.css';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
const TableComponent = () => {
  function createData(
    num: string,
    object: string,
    type: string,
    status: string,
    amount:number
  ) {
    return { num, object, type, status , amount };
  }
  
  const rows = [
    createData("afsjf544","an object","contract","executed",5000),
    createData("afsjf544","an object","contract","not executed",5000),
    createData("afsjf544","an object","contract","executed",5000),
    createData("afsjf544","an object","contract","executed with delay",5000),
  ];

  const getStyles = (status:string)=>{
    switch (status) {
      case 'executed':
        return {
          background:'green',
          color:"white"
        }
      case 'not executed':
        return {
          background:'red',
          color:"white"
        }
      case 'executed with delay':
        return {
          background:'orange',
          color:"white"
        }
        
          
    
      default:
        break;
    }

  }
  return (
    <div className={styles.container}>
      <h2>Dernier Accords</h2>
      <TableContainer  className={styles.tableContainer} component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead className={styles.tableHead}>
          <TableRow className={styles.tableRow}>
            <TableCell>numero</TableCell>
            <TableCell align="left">objet</TableCell>
            <TableCell align="left">type</TableCell>
            <TableCell align="left">status</TableCell>
            <TableCell align="left">montant</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row)=>(
            <TableRow
              key={row.num}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              className={styles.tableRow}
            >
              <TableCell component="th" scope="row">
                {row.num}
              </TableCell>
              <TableCell align="left">{row.object}</TableCell>
              <TableCell align="left">{row.type}</TableCell>
              <TableCell align="left">
                <span className={styles.status} style={getStyles(row.status)}>
                  {row.status}
                </span>
              </TableCell>
              <TableCell align="left">{row.amount}</TableCell>
              <TableCell align="left" className={styles.details}>Details</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </div>
  )
}

export default TableComponent