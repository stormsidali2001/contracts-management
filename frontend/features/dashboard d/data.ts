import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MapsHomeWorkOutlinedIcon from '@mui/icons-material/MapsHomeWorkOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import FaceRoundedIcon from '@mui/icons-material/FaceRounded';
export const sidebarData = [
    {
        icon:HomeOutlinedIcon,
        text:"Dashboard"
    },
    {
        icon:MapsHomeWorkOutlinedIcon,
        text:"Directions"
    },
    {
        icon:PeopleOutlinedIcon,
        text:"Utilisateurs"
    },
    {
        icon:ContactMailOutlinedIcon,
        text:"Fournisseurs"
    },
    {
        icon:HandshakeOutlinedIcon,
        text:"Accords"
    },
]

export const cardsData = [
    {
        title:"Connexions",
        styles:{
            background:"red",
            boxShadow:"0px 10px 20px 0px #e0c6f5"
        },
        barValue:70,
        png:HandshakeOutlinedIcon,
        series:[
            {
                name:"connections", //in the week
                data:[31,40,28,51,42,109,100]
            }
        ]
    },
    {
        title:"Agreements",
        styles:{
            background:"red",
            boxShadow:"0px 10px 20px 0px #e0c6f5"
        },
        barValue:70,
        png:HandshakeOutlinedIcon,
        series:[
            {
                name:"Agreements", //in the week
                data:[31,40,28,51,42,109,100]
            }
        ]
    },
    {
        title:"montant",
        styles:{
            background:"red",
            boxShadow:"0px 10px 20px 0px #e0c6f5"
        },
        barValue:70,
        png:HandshakeOutlinedIcon,
        series:[
            {
                name:"Revenu", //in the week
                data:[31,40,28,51,42,109,100]
            }
        ]
    }
]

export const updatesData = [

    {
    username:"juridique1",
    text:"a  ajoute un nouveau contrat",
    time:"depus 25 seconds",
    icon:GavelRoundedIcon
    },
    {
    username:"juridique1",
    text:"a  ajoute un nouveau contrat",
    time:"depus 25 seconds",
    icon:GavelRoundedIcon
    },
    {
    username:"juridique1",
    text:"a  ajoute un nouveau contrat",
    time:"depus 25 seconds",
    icon:GavelRoundedIcon
    },

  

    
]