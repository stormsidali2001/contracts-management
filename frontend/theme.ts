import {createTheme} from '@mui/material';

//@ts-ignore
export const theme = createTheme({
    components:{
        MuiStepIcon:{
           styleOverrides:{
            root:{
                text: {
                    fill: '#fefefe',
                  },

            }
           }
        },
     },
    palette:{
        primary:{
            main:'#17498E',
            contrastText:'white',
        },
        secondary:{
            main:'rgba(23, 73, 142, 0.6);',
            contrastText:'white',
            

        },
        
    }
})