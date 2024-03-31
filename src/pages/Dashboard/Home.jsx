import { Box, CssBaseline, List, ListItem, ListItemText, ListSubheader, Paper, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getUserLinks, getVisitsOfLink } from '../../firebase/utils';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function Home() {
    const [links, setLinks] = useState([])
    const [visits, setVisits] = useState({});
    const [countries, setCountries] = useState([]);
    useEffect(() => {
        const fetchLinksData = async () => {
            const data = await getUserLinks();
            data.sort((a, b) => {
                return dayjs.unix(b.creationTime.seconds).subtract(dayjs.unix(a.creationTime.seconds));
            });
            let tempCounter = 0;
            const arrProm = []
            data.forEach((link) => {
                arrProm.push(getVisitsOfLink(link.id))
            })
            const visits = await Promise.all(arrProm);
            const tempA = {}
            visits.forEach(({ id, visits }) => {
                tempCounter += (visits.length || 0);
                tempA[id] = visits;
            })
            const tempCountiesCounter = {}
            data.filter((link) => {
                const visits = tempA[link.id];
                visits.filter((visit) => dayjs.unix(visit.creationTime.seconds).isSameOrAfter(dayjs().startOf('month'))).forEach((visit) => {
                    if (tempCountiesCounter[visit.country]) {
                        tempCountiesCounter[visit.country]++;
                    } else {
                        tempCountiesCounter[visit.country] = 1;
                    }
                })
            })
            setCountries(Object.entries(tempCountiesCounter));
            setLinks(data);
            setVisits({ visits: { ...tempA }, total: tempCounter });
        }
        if (links.length === 0) {
            fetchLinksData();
        }
    }, [])
    return (
        <>
            <CssBaseline />
            <Stack width={"100%"} height={"100vh"} p={1} gap={2}>
                <Stack component={Paper} variant='outlined' p={1} justifyContent={"space-evenly"} direction={"row"} >
                    <Box textAlign={"center"}>
                        <Typography variant="h2" fontSize={22}>Links</Typography>
                        <Typography variant="body1" fontSize={16}>{links.length}</Typography>
                    </Box>
                    <Box textAlign={"center"}>
                        <Typography variant="h2" fontSize={22}>Visits</Typography>
                        <Typography variant="body1" fontSize={16}>{visits.total}</Typography>
                    </Box>
                </Stack>
                <Stack component={Paper} variant='outlined'>
                    <List
                        subheader={
                            <ListSubheader component="div" id="nested-list-subheader" sx={{ display: "flex", justifyContent: "space-between" }}><span>Latest links</span><span>Visits</span></ListSubheader>
                        }>
                        {links.slice(0, 4).map((link) => {
                            return (
                                <ListItem key={link.id}>
                                    <ListItemText primary={link.name} secondary={link.link} sx={{ ":first-letter": { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: "12ch", noWrap: true }} secondaryTypographyProps={{ maxWidth: "22ch", noWrap: true }} />
                                    <ListItemText primary={visits.visits[link.id]?.length || 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: "fit-content" }} />
                                </ListItem>
                            )
                        })}
                    </List>
                </Stack>
                <Stack component={Paper} variant='outlined'>
                    <List
                        subheader={
                            <ListSubheader component="div" id="nested-list-subheader" sx={{ display: "flex", justifyContent: "space-between" }}><span>Top countries last month</span><span>Visits</span></ListSubheader>
                        }>
                        {countries.length > 0 && countries.slice(0, 4).map((country) => {
                            return (
                                <ListItem key={country[0]}>
                                    <ListItemText primary={isoAlphaCode2ToCountries[country[0]]} sx={{ ":first-letter": { textTransform: 'uppercase' }, flexGrow: 2 }} primaryTypographyProps={{ maxWidth: "12ch", noWrap: true }} secondaryTypographyProps={{ maxWidth: "22ch", noWrap: true }} />
                                    <ListItemText primary={country[1] || 0} sx={{ flexGrow: 0 }} primaryTypographyProps={{ width: "fit-content" }} />
                                </ListItem>
                            )
                        })}
                    </List>
                </Stack>
            </Stack>
        </>
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