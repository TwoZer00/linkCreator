import { Box, Button, CssBaseline, List, ListItem, ListItemText, ListSubheader, Paper, Stack, Typography } from '@mui/material'
import  { useEffect, useState } from 'react'
import { getUserLinksOfLastMonth} from '../../firebase/utils';
import { useOutletContext } from 'react-router-dom';
import { label } from "../../locales/locale"

export function Home() {
    const [links, setLinks] = useState([])
    const [data, setData] = useOutletContext();
    useEffect(() => {
        const fetchLinksData = async () => {
            setData((value) => { return { ...value, loading: true } })
            const userLinks = data?.userLinks || await getUserLinksOfLastMonth();
            setLinks(userLinks);
            setData((value) => { return { ...value, loading: false } })
        }
        if (links.length === 0 && data?.loading != true) {
            fetchLinksData();
        }
    }, [])
    return (
        <>
            <CssBaseline />
            <Stack width={"100%"} height={"100%"} gap={2}>
                <Stack component={Paper} variant='outlined' p={1} justifyContent={"space-evenly"} direction={"row"} >
                    <Box textAlign={"center"}>
                        <Typography variant="h2" fontSize={22} sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("links")}</Typography>
                        <Typography variant="body1" fontSize={16}>{data.user?.links?.total||0}</Typography>
                    </Box>
                    <Box textAlign={"center"}>
                        <Typography variant="h2" fontSize={22} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("visits")}</Typography>
                        <Typography variant="body1" fontSize={16}>{data.user?.links?.visits?.total||0}</Typography>
                    </Box>
                </Stack>
                <Stack component={Paper} variant='outlined' height={"fit-content"}>
                    <List
                        subheader={
                            <ListSubheader component="div" id="nested-list-subheader" sx={{ display: "flex", justifyContent: "space-between", ":first-letter": { textTransform: 'uppercase' } }}><Typography variant="inherit" sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("latest-links")}</Typography><Typography variant="inherit" sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("visits")}</Typography></ListSubheader>
                        }>
                        {links?.length > 0 ? links?.map((link) => {
                            return (
                                <ListItem key={link.id}>
                                    <ListItemText primary={link.name} secondary={link.link} sx={{ ":first-letter": { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: "12ch", noWrap: true }} secondaryTypographyProps={{ maxWidth: "22ch", noWrap: true }} />
                                    <ListItemText primary={link.visits?.total|| 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: "fit-content" }} />
                                </ListItem>
                            )
                        })
                            :
                            <Typography color={"GrayText"} textAlign={"center"} p={2} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >
                                {label("no-links")}
                            </Typography>
                        }
                    </List>
                </Stack>
                <Stack component={Paper} variant='outlined' height={"fit-content"}>
                    <List
                        subheader={
                            <ListSubheader component="div" id="nested-list-subheader" sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant='inherit' sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("top-countries")}</Typography><Typography variant='inherit' sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("visits")}</Typography></ListSubheader>
                        }
                    >
                        {data.user?.links?.visits?.byCountry?.filter(item=>item.count>0).length > 0 ? data.user?.links?.visits?.byCountry?.slice(0,4).map((country) => {
                            return (
                                <ListItem key={country.country}>
                                    <ListItemText primary={isoAlphaCode2ToCountries[country.country]} sx={{ ":first-letter": { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: "12ch", noWrap: true }} secondaryTypographyProps={{ maxWidth: "22ch", noWrap: true }} />
                                    <ListItemText primary={country.count || 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: "fit-content" }} />
                                </ListItem>
                            )
                        })
                            
                            :
                            <Typography color={"GrayText"} textAlign={"center"} p={2} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >
                                {
                                    label("not-enough-data")
                                }
                            </Typography>
                        }
                    </List>
                    {/* <Button variant='text' size='small' >
                        Load more
                    </Button> */}
                </Stack>
                <Stack component={Paper} variant='outlined'>
                    <List
                        subheader={
                            <ListSubheader component="div" id="nested-list-subheader" sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant='inherit' sx={{ ":first-letter": { textTransform: 'uppercase' } }} >{label("top-devices")}</Typography><Typography variant='inherit' sx={{ ":first-letter": { textTransform: 'uppercase' } }}>{label("devices")}</Typography></ListSubheader>
                        }
                    >
                        {data.user?.links?.visits?.byDevice?.filter(item=>item.count>0).length>0?data.user?.links?.visits?.byDevice?.slice(0,4).map((item) => {
                            return (
                                <ListItem key={item.device}>
                                    <ListItemText primary={item.device} sx={{ ":first-letter": { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: "12ch", noWrap: true }} secondaryTypographyProps={{ maxWidth: "22ch", noWrap: true }} />
                                    <ListItemText primary={item.count || 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: "fit-content" }} />
                                </ListItem>
                            )
                        })
                        :
                            <Typography color={"GrayText"} textAlign={"center"} p={2} sx={{ ":first-letter": { textTransform: 'uppercase' } }} >
                                {
                                    label("not-enough-data")
                                }
                            </Typography>
                        }
                    </List>
                    {/* <Button variant='text' size='small' >
                        Load more
                    </Button> */}
                </Stack>
            </Stack>
        </>
        // <>
        // </>
    )
}

const isoAlphaCode2ToCountries = {
    "AF": "Afghanistan",
    "AX": "Aland Islands",
    "AL": "Albania",
    "DZ": "Algeria",
    "AS": "American Samoa",
    "AD": "Andorra",
    "AO": "Angola",
    "AI": "Anguilla",
    "AQ": "Antarctica",
    "AG": "Antigua And Barbuda",
    "AR": "Argentina",
    "AM": "Armenia",
    "AW": "Aruba",
    "AU": "Australia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    "BS": "Bahamas",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BB": "Barbados",
    "BY": "Belarus",
    "BE": "Belgium",
    "BZ": "Belize",
    "BJ": "Benin",
    "BM": "Bermuda",
    "BT": "Bhutan",
    "BO": "Bolivia",
    "BA": "Bosnia And Herzegovina",
    "BW": "Botswana",
    "BV": "Bouvet Island",
    "BR": "Brazil",
    "IO": "British Indian Ocean Territory",
    "BN": "Brunei Darussalam",
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "BI": "Burundi",
    "KH": "Cambodia",
    "CM": "Cameroon",
    "CA": "Canada",
    "CV": "Cape Verde",
    "KY": "Cayman Islands",
    "CF": "Central African Republic",
    "TD": "Chad",
    "CL": "Chile",
    "CN": "China",
    "CX": "Christmas Island",
    "CC": "Cocos (Keeling) Islands",
    "CO": "Colombia",
    "KM": "Comoros",
    "CG": "Congo",
    "CD": "Congo, Democratic Republic",
    "CK": "Cook Islands",
    "CR": "Costa Rica",
    "CI": "Cote D\"Ivoire",
    "HR": "Croatia",
    "CU": "Cuba",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DJ": "Djibouti",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "EC": "Ecuador",
    "EG": "Egypt",
    "SV": "El Salvador",
    "GQ": "Equatorial Guinea",
    "ER": "Eritrea",
    "EE": "Estonia",
    "ET": "Ethiopia",
    "FK": "Falkland Islands (Malvinas)",
    "FO": "Faroe Islands",
    "FJ": "Fiji",
    "FI": "Finland",
    "FR": "France",
    "GF": "French Guiana",
    "PF": "French Polynesia",
    "TF": "French Southern Territories",
    "GA": "Gabon",
    "GM": "Gambia",
    "GE": "Georgia",
    "DE": "Germany",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GR": "Greece",
    "GL": "Greenland",
    "GD": "Grenada",
    "GP": "Guadeloupe",
    "GU": "Guam",
    "GT": "Guatemala",
    "GG": "Guernsey",
    "GN": "Guinea",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HT": "Haiti",
    "HM": "Heard Island & Mcdonald Islands",
    "VA": "Holy See (Vatican City State)",
    "HN": "Honduras",
    "HK": "Hong Kong",
    "HU": "Hungary",
    "IS": "Iceland",
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran, Islamic Republic Of",
    "IQ": "Iraq",
    "IE": "Ireland",
    "IM": "Isle Of Man",
    "IL": "Israel",
    "IT": "Italy",
    "JM": "Jamaica",
    "JP": "Japan",
    "JE": "Jersey",
    "JO": "Jordan",
    "KZ": "Kazakhstan",
    "KE": "Kenya",
    "KI": "Kiribati",
    "KR": "Korea",
    "KP": "North Korea",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    "LA": "Lao People\"s Democratic Republic",
    "LV": "Latvia",
    "LB": "Lebanon",
    "LS": "Lesotho",
    "LR": "Liberia",
    "LY": "Libyan Arab Jamahiriya",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MO": "Macao",
    "MK": "Macedonia",
    "MG": "Madagascar",
    "MW": "Malawi",
    "MY": "Malaysia",
    "MV": "Maldives",
    "ML": "Mali",
    "MT": "Malta",
    "MH": "Marshall Islands",
    "MQ": "Martinique",
    "MR": "Mauritania",
    "MU": "Mauritius",
    "YT": "Mayotte",
    "MX": "Mexico",
    "FM": "Micronesia, Federated States Of",
    "MD": "Moldova",
    "MC": "Monaco",
    "MN": "Mongolia",
    "ME": "Montenegro",
    "MS": "Montserrat",
    "MA": "Morocco",
    "MZ": "Mozambique",
    "MM": "Myanmar",
    "NA": "Namibia",
    "NR": "Nauru",
    "NP": "Nepal",
    "NL": "Netherlands",
    "AN": "Netherlands Antilles",
    "NC": "New Caledonia",
    "NZ": "New Zealand",
    "NI": "Nicaragua",
    "NE": "Niger",
    "NG": "Nigeria",
    "NU": "Niue",
    "NF": "Norfolk Island",
    "MP": "Northern Mariana Islands",
    "NO": "Norway",
    "OM": "Oman",
    "PK": "Pakistan",
    "PW": "Palau",
    "PS": "Palestinian Territory, Occupied",
    "PA": "Panama",
    "PG": "Papua New Guinea",
    "PY": "Paraguay",
    "PE": "Peru",
    "PH": "Philippines",
    "PN": "Pitcairn",
    "PL": "Poland",
    "PT": "Portugal",
    "PR": "Puerto Rico",
    "QA": "Qatar",
    "RE": "Reunion",
    "RO": "Romania",
    "RU": "Russian Federation",
    "RW": "Rwanda",
    "BL": "Saint Barthelemy",
    "SH": "Saint Helena",
    "KN": "Saint Kitts And Nevis",
    "LC": "Saint Lucia",
    "MF": "Saint Martin",
    "PM": "Saint Pierre And Miquelon",
    "VC": "Saint Vincent And Grenadines",
    "WS": "Samoa",
    "SM": "San Marino",
    "ST": "Sao Tome And Principe",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "RS": "Serbia",
    "SC": "Seychelles",
    "SL": "Sierra Leone",
    "SG": "Singapore",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "SB": "Solomon Islands",
    "SO": "Somalia",
    "ZA": "South Africa",
    "GS": "South Georgia And Sandwich Isl.",
    "ES": "Spain",
    "LK": "Sri Lanka",
    "SD": "Sudan",
    "SR": "Suriname",
    "SJ": "Svalbard And Jan Mayen",
    "SZ": "Swaziland",
    "SE": "Sweden",
    "CH": "Switzerland",
    "SY": "Syrian Arab Republic",
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TZ": "Tanzania",
    "TH": "Thailand",
    "TL": "Timor-Leste",
    "TG": "Togo",
    "TK": "Tokelau",
    "TO": "Tonga",
    "TT": "Trinidad And Tobago",
    "TN": "Tunisia",
    "TR": "Turkey",
    "TM": "Turkmenistan",
    "TC": "Turks And Caicos Islands",
    "TV": "Tuvalu",
    "UG": "Uganda",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "GB": "United Kingdom",
    "US": "United States",
    "UM": "United States Outlying Islands",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VU": "Vanuatu",
    "VE": "Venezuela",
    "VN": "Vietnam",
    "VG": "Virgin Islands, British",
    "VI": "Virgin Islands, U.S.",
    "WF": "Wallis And Futuna",
    "EH": "Western Sahara",
    "YE": "Yemen",
    "ZM": "Zambia",
    "ZW": "Zimbabwe"
}