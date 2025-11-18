/** @typedef {import('#utils/db-client/index.js').Prisma.LPACreateInput} LPA */

/**
 * @returns {LPA[]}
 */
export const localPlanningDepartmentList = [
	{
		lpaCode: 'Q9999',
		name: 'System Test Borough Council',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
	},
	{
		lpaCode: 'Q1111',
		name: 'System Test Borough Council 2',
		email: 'appealplanningdecisiontest@planninginspectorate.gov.uk'
	},
	{
		lpaCode: 'N5090',
		name: 'Barnet',
		email: 'planning.appeals@barnet.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'H1705',
		name: 'Basingstoke and Deane Borough Council',
		email: 'appeals@basingstoke.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'F0114',
		name: 'Bath and North East Somerset Council',
		email: 'Planning_appeals@bathnes.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'V1260',
		name: 'Bournemouth, Christchurch and Poole',
		email: 'planning.appeals@bcpcouncil.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'G5180',
		name: 'Bromley',
		email: 'planningappeals@bromley.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'K0425',
		name: 'Buckinghamshire Council - Wycombe Area',
		email: 'planning.wyc@buckinghamshire.gov.uk'
	},
	{
		lpaCode: 'X3405',
		name: 'Cannock Chase District Council',
		email: 'developmentcontrol@cannockchasedc.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'D0840',
		name: 'Cornwall Council',
		email: 'planningappeals@cornwall.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'F1610',
		name: 'Cotswold District Council',
		email: 'planning.appeals@cotswold.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'U4610',
		name: 'Coventry City Council',
		email: 'planning@coventry.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'J9497',
		name: 'Dartmoor National Park Authority',
		email: 'planning@dartmoor.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'D1265',
		name: 'Dorset',
		email: 'Appeals@dorsetcouncil.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'C4615',
		name: 'Dudley Metropolitan Borough Council',
		email: 'development.control@dudley.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'U1105',
		name: 'East Devon District Council',
		email: 'planningappeals@eastdevon.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'B3410',
		name: 'East Staffordshire Borough Council',
		email: 'dcsupport@eaststaffsbc.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'W1715',
		name: 'Eastleigh Borough Council',
		email: 'ebcplanningsupport@eastleigh.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'Y1110',
		name: 'Exeter City Council',
		email: 'planning@exeter.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'F9498',
		name: 'Exmoor National Park Authority',
		email: 'plan@exmoor-nationalpark.gov.uk'
	},
	{
		lpaCode: 'A1720',
		name: 'Fareham Borough Council',
		email: 'devcontrol@fareham.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'P1615',
		name: 'Forest of Dean District Council',
		email: 'planning.appeals@fdean.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'U1620',
		name: 'Gloucester City Council',
		email: 'business.support@gloucester.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'T1600',
		name: 'Gloucestershire',
		email: 'planningdc@gloucestershire.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'J1725',
		name: 'Gosport',
		email: 'planning@gosport.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'E5330',
		name: 'Greenwich',
		email: 'planning-enforcement@royalgreenwich.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'N1730',
		name: 'Hart District Council',
		email: 'appeals@hart.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'X1735',
		name: 'Havant Borough Council',
		email: 'planning.development@havant.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'B5480',
		name: 'Havering',
		email: 'planning_appeals@havering.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'W1850',
		name: 'Herefordshire Council',
		email: 'planning_enquiries@herefordshire.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'P2114',
		name: 'Isle of Wight Council',
		email: 'planning.appeals@iow.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'K3415',
		name: 'Lichfield District Council',
		email: 'appeals@lichfielddc.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'J1860',
		name: 'Malvern Hills District Council',
		email: 'developmentcontrol@malvernhills.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'Y1138',
		name: 'Mid Devon District Council',
		email: 'appeals@middevon.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'B1740',
		name: 'New Forest District Council',
		email: 'planning.appeals@nfdc.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'B9506',
		name: 'New Forest National Park Authority',
		email: 'appeals@newforestnpa.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'P3420',
		name: 'Newcastle-under-Lyme Borough Council',
		email: 'planningapplications@newcastle-staffs.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'X1118',
		name: 'North Devon District Council',
		email: 'planningappeals@northdevon.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'R3705',
		name: 'North Warwickshire Borough Council',
		email: 'planningcontrol@northwarks.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'W3710',
		name: 'Nuneaton and Bedworth Borough Council',
		email: 'planning@nuneatonandbedworth.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'N1160',
		name: 'Plymouth City Council',
		email: 'planningconsents@plymouth.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'L5810',
		name: 'Richmond',
		email: 'richmondplanningappeals@richmondandwandsworth.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'E3715',
		name: 'Rugby Borough Council',
		email: 'planningappeals@rugby.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'P1750',
		name: 'Rushmoor Borough Council',
		email: 'plan@rushmoor.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'L3245',
		name: 'Shropshire Council',
		email: 'appeals@shropshire.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'J0350',
		name: 'Slough Borough Council',
		email: 'planning@slough.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'Q4625',
		name: 'Solihull Metropolitan Borough Council',
		email: 'planningenforcement@solihull.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'Y9507',
		name: 'South Downs National Park Authority',
		email: 'planning@southdowns.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'K1128',
		name: 'South Hams District Council',
		email: 'Dm.appeals@swdevon.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'Q3115',
		name: 'South Oxfordshire District Council',
		email: 'registration@southoxon.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'D1780',
		name: 'Southampton City Council',
		email: 'planning.appeal@southampton.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'Y3425',
		name: 'Stafford Borough Council',
		email: 'planning@staffordbc.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'B3438',
		name: 'Staffordshire Moorlands District Council',
		email: 'planning@staffsmoorlands.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'J3720',
		name: 'Stratford-on-Avon District Council',
		email: 'planning.appeals@stratford-dc.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'C1625',
		name: 'Stroud District Council',
		email: 'planning.appeals@stroud.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'U3935',
		name: 'Swindon Borough Council',
		email: 'appeals@swindon.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'Z3445',
		name: 'Tamworth Borough Council',
		email: 'planningadmin@tamworth.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'P1133',
		name: 'Teignbridge District Council',
		email: 'planningappeals@teignbridge.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'C3240',
		name: 'Telford and Wrekin Council',
		email: 'planningappeals@telford.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'C1760',
		name: 'Test Valley Borough Council',
		email: 'planning@testvalley.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'G1630',
		name: 'Tewkesbury Borough Council',
		email: 'appealsadmin@tewkesbury.gov.uk',
		teamId: 8 // West2
	},
	{
		lpaCode: 'Z0835',
		name: 'The Isles of Scilly Council',
		email: 'planning@scilly.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'X1165',
		name: 'Torbay Council',
		email: 'planning@torbay.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'W1145',
		name: 'Torridge District Council',
		email: 'planningsupport@torridge.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'V3120',
		name: 'Vale of White Horse District Council',
		email: 'registration@whitehorsedc.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'V4630',
		name: 'Walsall Metropolitan Borough Council',
		email: 'planningservices@walsall.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'T3725',
		name: 'Warwick District Council',
		email: 'planning_appeals@warwickdc.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'W0340',
		name: 'West Berkshire District Council',
		email: 'appeals@westberks.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'Q1153',
		name: 'West Devon Borough Council',
		email: 'dc@westdevon.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'D3125',
		name: 'West Oxfordshire District Council',
		email: 'Planning.Appeals@westoxon.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'Y3940',
		name: 'Wiltshire Council',
		email: 'planningappeals@wiltshire.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'L1765',
		name: 'Winchester City Council',
		email: 'appeals@winchester.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'D4635',
		name: 'Wolverhampton City Council',
		email: 'planning.appeals@wolverhampton.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'M3835',
		name: 'Worthing Borough Council',
		email: 'planning-worthing@adur-worthing.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'H1840',
		name: 'Wychavon District Council',
		email: 'Planning.Appeals@wychavon.gov.uk',
		teamId: 9 // West3
	},
	{
		lpaCode: 'R1845',
		name: 'Wyre Forest District Council',
		email: 'planning.admin@wyreforestdc.gov.uk',
		teamId: 10 // West4
	},
	{
		lpaCode: 'M1005',
		name: 'Amber Valley Borough Council',
		email: 'planningappeals@ambervalley.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'W3005',
		name: 'Ashfield District Council',
		email: 'planning.admin@ashfield-dc.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'D3505',
		name: 'Babergh District Council',
		email: 'planning@baberghmidsuffolk.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'R4408',
		name: 'Barnsley Borough Council',
		email: 'developmentcontrol@barnsley.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'A3010',
		name: 'Bassetlaw District Council',
		email: 'planningappeals@bassetlaw.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'T2405',
		name: 'Blaby District Council',
		email: 'planning@blaby.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'M2372',
		name: 'Blackburn with Darwen Borough Council',
		email: 'planning@blackburn.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'R1010',
		name: 'Bolsover District Council',
		email: 'dev.control@bolsover.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'N4205',
		name: 'Bolton Metropolitan Borough Council',
		email: 'planning.control@bolton.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'Z2505',
		name: 'Boston Borough Council',
		email: 'Planning@boston.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'H1515',
		name: 'Brentwood Borough Council',
		email: 'planning@brentwood.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'K2610',
		name: 'Broadland District Council',
		email: 'planning.administration@broadland.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'E9505',
		name: 'Broads Authority',
		email: 'planning@broads-authority.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'W1905',
		name: 'Borough of Broxbourne',
		email: 'planning@broxbourne.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'J3015',
		name: 'Broxtowe Borough Council',
		email: 'planningappeals@broxtowe.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'Z2315',
		name: 'Burnley Borough Council',
		email: 'planning@burnley.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'A4710',
		name: 'Calderdale Metropolitan Borough Council',
		email: 'planningappeals@calderdale.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'Q0505',
		name: 'Cambridge City Council',
		email: 'appeals@greatercambridgeplanning.org',
		teamId: 18 // North4
	},
	{
		lpaCode: 'E0535',
		name: 'Cambridgeshire County Council',
		email: 'planningdc@cambridgeshire.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'M1520',
		name: 'Castle Point Borough Council',
		email: 'planning@castlepoint.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'X2410',
		name: 'Charnwood Borough Council',
		email: 'development.control@charnwood.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'A1015',
		name: 'Chesterfield Borough Council',
		email: 'planning@chesterfield.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'L3815',
		name: 'Chichester District Council',
		email: 'planningappeals@chichester.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'M2515',
		name: 'City of Lincoln Council',
		email: 'developmentteam@lincoln.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'F0935',
		name: 'Cumberland Council',
		email: 'planning.appeals@cumberland.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'A1910',
		name: 'Dacorum Borough Council',
		email: 'planning@dacorum.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'N1350',
		name: 'Darlington Borough Council',
		email: 'planning.enquiries@darlington.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'U1050',
		name: 'Derbyshire County Council',
		email: 'planningcontrol@derbyshire.gov.uk',
		teamId: null
	},
	{
		lpaCode: 'P1045',
		name: 'Derbyshire Dales District Council',
		email: 'planning@derbyshiredales.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'F4410',
		name: 'Doncaster Metropolitan Borough Council',
		email: 'tsi@doncaster.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'V0510',
		name: 'East Cambridgeshire District Council',
		email: 'appeals@eastcambs.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'D2510',
		name: 'East Lindsey District Council',
		email: 'planning.appeals@e-lindsey.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'J2285',
		name: 'Ebbsfleet Development Corporation',
		email: 'EDCplanning@ebbsfleetdc.org.uk',
		teamId: null
	},
	{
		lpaCode: 'N1025',
		name: 'Erewash Borough Council',
		email: 'planning@erewash.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'Z1585',
		name: 'Essex County Council',
		email: 'mineralsandwastedm@essex.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'D0515',
		name: 'Fenland District Council',
		email: 'planningappeals@fenland.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'M2325',
		name: 'Fylde Borough Council',
		email: 'planning@fylde.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'H4505',
		name: 'Gateshead Metropolitan Borough Council',
		email: 'planning@gateshead.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'N3020',
		name: 'Gedling Borough Council',
		email: 'PandEServiceSupport@gedling.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'K2230',
		name: 'Gravesham Borough Council',
		email: 'planning.appeals@gravesham.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'U2615',
		name: 'Great Yarmouth Borough Council',
		email: 'plan@great-yarmouth.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'D0650',
		name: 'Halton Borough Council',
		email: 'dev.control@halton.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'Q1770',
		name: 'Hampshire County Council',
		email: 'planning@hants.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'F2415',
		name: 'Harborough District Council',
		email: 'planning@harborough.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'N1540',
		name: 'Harlow District Council',
		email: 'planning.services@harlow.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'H0724',
		name: 'Hartlepool Borough Council',
		email: 'developmentcontrol@hartlepool.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'B1415',
		name: 'Hastings Borough Council',
		email: 'dcenquiries@hastings.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'M1900',
		name: 'Hertfordshire County Council',
		email: 'spatialplanning@hertfordshire.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'N1920',
		name: 'Hertsmere Borough Council',
		email: 'appeals.planning@Hertsmere.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'H1033',
		name: 'High Peak Borough Council',
		email: 'planning@highpeak.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'K2420',
		name: 'Hinckley and Bosworth Borough Council',
		email: 'planningappeal@hinckley-bosworth.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'H0520',
		name: 'Huntingdonshire District Council',
		email: 'planning.appeals@huntingdonshire.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'R2330',
		name: 'Hyndburn Borough Council',
		email: 'planning@hyndburnbc.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'R3515',
		name: 'Ipswich Borough Council',
		email: 'development.management@ipswich.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'W2275',
		name: 'Kent County Council',
		email: 'planning.applications@kent.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'V2004',
		name: 'Kingston-Upon-Hull City Council',
		email: 'dev.control@hullcc.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'Z4718',
		name: 'Kirklees Metropolitan Council',
		email: 'dc.admin@kirklees.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'V4305',
		name: 'Knowsley Metropolitan Borough Council',
		email: 'dcconsultations@knowsley.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'Q9495',
		name: 'Lake District National Park',
		email: 'appeals@lake-district.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'Q2371',
		name: 'Lancashire County Council',
		email: 'devcon@lancashire.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'W2465',
		name: 'Leicester City Council',
		email: 'planning@leicester.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'Z5060',
		name: 'London Borough of Barking and Dagenham Council',
		email: 'Planning@lbbd.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'R5510',
		name: 'London Borough of Hillingdon',
		email: 'PlanningAppeals@Hillingdon.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'N5660',
		name: 'London Borough of Lambeth',
		email: 'planningappeals@lambeth.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'W5780',
		name: 'London Borough of Redbridge',
		email: 'planning.appeals@redbridge.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'X1545',
		name: 'Maldon District Council',
		email: 'dc.planning@maldon.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'X3025',
		name: 'Mansfield District Council',
		email: 'pbc@mansfield.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'A2280',
		name: 'Medway Council',
		email: 'planningappeals@medway.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'Y2430',
		name: 'Melton Borough Council',
		email: 'externaldevelopmentcontrol@melton.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'D3830',
		name: 'Mid Sussex District Council',
		email: 'planningappeals@midsussex.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'W0734',
		name: 'Middlesbrough Council',
		email: 'developmentcontrol@middlesbrough.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'B3030',
		name: 'Newark & Sherwood District Council',
		email: 'planningappeals@newark-sherwooddc.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'X2600',
		name: 'Norfolk County Council',
		email: 'mawp@norfolk.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'R1038',
		name: 'North East Derbyshire District Council',
		email: 'developmentcontrol@ne-derbyshire.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'B2002',
		name: 'North East Lincolnshire Council',
		email: 'Planning@nelincs.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'X1925',
		name: 'North Hertfordshire District Council',
		email: 'planning.appeals@north-herts.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'R2520',
		name: 'North Kesteven District Council',
		email: 'planning@n-kesteven.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'Y2620',
		name: 'North Norfolk District Council',
		email: 'planning-appeals@north-norfolk.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'W4515',
		name: 'North Tyneside Council',
		email: 'development.control@northtyneside.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'G2435',
		name: 'North West Leicestershire District Council',
		email: 'development.control@nwleicestershire.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'W9500',
		name: 'North York Moors National Park Authority',
		email: 'dc@northyorkmoors-npa.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'T9501',
		name: 'Northumberland National Park Authority',
		email: 'planning@nnpa.org.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'Q3060',
		name: 'Nottingham City Council',
		email: 'planningappeals@nottinghamcity.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'L2440',
		name: 'Oadby and Wigston Borough Council',
		email: 'planning@oadby-wigston.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'F5730',
		name: 'Old Oak and Park Royal Development Corporation',
		email: 'planningapplications@opdc.london.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'U3100',
		name: 'Oxfordshire County Council',
		email: 'planning@oxfordshire.gov.uk',
		teamId: 7 // West1
	},
	{
		lpaCode: 'M9496',
		name: 'Peak District National Park Authority',
		email: 'planningappeals@peakdistrict.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'E2340',
		name: 'Pendle Borough Council',
		email: 'planning@pendle.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'J0540',
		name: 'Peterborough City Council',
		email: 'planningappeals@peterborough.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'N2345',
		name: 'Preston City Council',
		email: 'devcon@preston.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'V0728',
		name: 'Redcar and Cleveland Borough Council',
		email: 'planning_admin@redcar-cleveland.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'T2350',
		name: 'Ribble Valley Borough Council',
		email: 'planningappeals@ribblevalley.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'B1550',
		name: 'Rochford District Council',
		email: 'planning.appeals@rochford.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'B2355',
		name: 'Rossendale Borough Council',
		email: 'planningappeals@rossendalebc.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'U1430',
		name: 'Rother District Council',
		email: 'Planning-Appeals@rother.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'P4415',
		name: 'Rotherham Metropolitan Borough Council',
		email: 'development.control@rotherham.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'K5600',
		name: 'Royal Borough of Kensington and Chelsea',
		email: 'planningappeals@rbkc.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'P3040',
		name: 'Rushcliffe Borough Council',
		email: 'planningappealsadmin@rushcliffe.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'A2470',
		name: 'Rutland County Council',
		email: 'planningappeals@rutland.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'M4320',
		name: 'Sefton Metropolitan Borough Council',
		email: 'planning.appeals@sefton.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'G2245',
		name: 'Sevenoaks District Council',
		email: 'appeals@sevenoaks.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'W0530',
		name: 'South Cambridgeshire District Council',
		email: 'DSAppeals@scambs.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'F1040',
		name: 'South Derbyshire District Council',
		email: 'Planning@southderbyshire.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'A2525',
		name: 'South Holland District Council',
		email: 'planningadvice@sholland.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'E2530',
		name: 'South Kesteven District Council',
		email: 'Planning@southkesteven.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'L2630',
		name: 'South Norfolk District Council',
		email: 'planning@southnorfolkandbroadland.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'F2360',
		name: 'South Ribble Borough Council',
		email: 'planning@southribble.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'A4520',
		name: 'South Tyneside Council',
		email: 'planningapplications@southtyneside.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'K1935',
		name: 'Stevenage Borough Council',
		email: 'planning@stevenage.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'V3500',
		name: 'Suffolk County Council',
		email: 'planning@suffolk.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'J4525',
		name: 'Sunderland City Council',
		email: 'dc@sunderland.gov.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'B3600',
		name: 'Surrey County Council',
		email: 'mwcd@surreycc.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'V2255',
		name: 'Swale Borough Council',
		email: 'appeals@swale.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'P1560',
		name: 'Tendring District Council',
		email: 'appeals.planningservices@tendringdc.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'Z2260',
		name: 'Thanet District Council',
		email: 'planning.services@thanet.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'P1940',
		name: 'Three Rivers District Council',
		email: 'trdc.appeals@threerivers.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'M1595',
		name: 'Thurrock Borough Council',
		email: 'plan.appeals@thurrock.gov.uk',
		teamId: 11 // East1
	},
	{
		lpaCode: 'H2265',
		name: 'Tonbridge and Malling Borough Council',
		email: 'planning.appeals@tmbc.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'M2270',
		name: 'Tunbridge Wells Borough Council',
		email: 'planningappeals@tunbridgewells.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'Y1945',
		name: 'Watford Borough Council',
		email: 'developmentcontrol@watford.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'C1950',
		name: 'Welwyn Hatfield Council',
		email: 'planningappeals@welhat.gov.uk',
		teamId: 13 // East3
	},
	{
		lpaCode: 'K0940',
		name: 'Westmorland and Furness Council',
		email: 'appeals4@westmorlandandfurness.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'N2535',
		name: 'West Lindsey District Council',
		email: 'Planning.Customer.Care@west-lindsey.gov.uk',
		teamId: 17 // North3
	},
	{
		lpaCode: 'F3545',
		name: 'West Suffolk',
		email: 'planning.technical@westsuffolk.gov.uk',
		teamId: 14 // East4
	},
	{
		lpaCode: 'V4250',
		name: 'Wigan Metropolitan Borough Council',
		email: 'planning@wigan.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'W4325',
		name: 'Wirral Metropolitan Borough Council',
		email: 'appeals@wirral.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'U2370',
		name: 'Wyre Borough Council',
		email: 'planning@wyre.gov.uk',
		teamId: 15 // North1
	},
	{
		lpaCode: 'C9499',
		name: 'Yorkshire Dales National Park Authority',
		email: 'planning@yorkshiredales.org.uk',
		teamId: 16 // North2
	},
	{
		lpaCode: 'Y3805',
		name: 'Adur District Council',
		email: 'planning-Adur@adur-worthing.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'P4605',
		name: 'Birmingham City Council',
		email: 'planning.appeals@birmingham.gov.uk',
		teamId: 10 //west4
	},
	{
		lpaCode: 'R0335',
		name: 'Bracknell Forest Borough Council',
		email: 'planning.appeals@bracknell-forest.gov.uk',
		teamId: 7 //West1
	},
	{
		lpaCode: 'Z0116',
		name: 'Bristol City Council',
		email: 'development.management@bristol.gov.uk',
		teamId: 10 //west4
	},
	{
		lpaCode: 'B1605',
		name: 'Cheltenham Borough Council',
		email: 'planningappeals@cheltenham.gov.uk',
		teamId: 8 //West2
	},
	{
		lpaCode: 'C3105',
		name: 'Cherwell District Council',
		email: 'submit.appeal@cherwell-dc.gov.uk',
		teamId: 9 //West3
	},
	{
		lpaCode: 'T1410',
		name: 'Eastbourne Borough Council',
		email: 'customerfirst@lewes-eastbourne.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'M1710',
		name: 'East Hampshire District Council',
		email: 'planning.appeals@easthants.gov.uk',
		teamId: 7 //West1
	},
	{
		lpaCode: 'L2250',
		name: 'Folkestone and Hythe District Council',
		email: 'Planning@folkestone-hythe.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'P1425',
		name: 'Lewes District Council',
		email: 'planningfirst@lewes-eastbourne.gov.uk',
		teamId: 12 // East2
	},
	{
		lpaCode: 'X5210',
		name: 'London Borough of Camden',
		email: 'planningappeals@camden.gov.uk',
		teamId: 18 // North4
	},
	{
		lpaCode: 'F5540',
		name: 'London Borough of Hounslow',
		email: 'planningappeals@hounslow.gov.uk',
		teamId: 8 //West2
	},
	{
		lpaCode: 'T5720',
		name: 'London Borough of Merton',
		email: 'planning.appeals@merton.gov.uk',
		teamId: 14 //East4
	},
	{
		lpaCode: 'A5840',
		name: 'London Borough of Southwark',
		email: 'planning.appeals@southwark.gov.uk',
		teamId: 14 //East4
	},
	{
		lpaCode: 'P5870',
		name: 'London Borough of Sutton',
		email: 'developmentcontrol@sutton.gov.uk',
		teamId: 14 //East4
	},
	{
		lpaCode: 'H5960',
		name: 'London Borough of Wandsworth',
		email: 'planningappeals@wandsworth.gov.uk',
		teamId: 7 //West1
	},
	{
		lpaCode: 'Y0435',
		name: 'Milton Keynes Council',
		email: 'dcappeals@milton-keynes.gov.uk',
		teamId: 9 //West3
	},
	{
		lpaCode: 'D0121',
		name: 'North Somerset Council',
		email: 'DMAppeals@n-somerset.gov.uk',
		teamId: 10 //west4
	},
	{
		lpaCode: 'G3110',
		name: 'Oxford City Council',
		email: 'planningappeals@oxford.gov.uk',
		teamId: 9 //West3
	},
	{
		lpaCode: 'Z1775',
		name: 'Portsmouth City Council',
		email: 'planningapps@portsmouthcc.gov.uk',
		teamId: 7 //West1
	},
	{
		lpaCode: 'E0345',
		name: 'Reading Borough Council',
		email: 'plgadmin@reading.gov.uk',
		teamId: 7 //West1
	},
	{
		lpaCode: 'Z5630',
		name: 'Royal Borough of Kingston Upon Thames',
		email: 'planning.appeals@kingston.gov.uk',
		teamId: 14 //East4
	},
	{
		lpaCode: 'T0355',
		name: 'Royal Borough of Windsor and Maidenhead',
		email: 'planning.appeals@rbwm.gov.uk',
		teamId: 10 //west4
	},
	{
		lpaCode: 'G4620',
		name: 'Sandwell Metropolitan Borough Council',
		email: 'planning@sandwell.gov.uk',
		teamId: 7 //West1
	},
	{
		lpaCode: 'P0119',
		name: 'South Gloucestershire Council',
		email: 'planningsupport@southglos.gov.uk',
		teamId: 8 //West2
	},
	{
		lpaCode: 'C3430',
		name: 'South Staffordshire District Council',
		email: 'Appeals@sstaffs.gov.uk',
		teamId: 8 //West2
	},
	{
		lpaCode: 'M3455',
		name: 'Stoke-on-Trent City Council',
		email: 'planning@stoke.gov.uk',
		teamId: 8 //West2
	},
	{
		lpaCode: 'X0360',
		name: 'Wokingham Borough Council',
		email: 'planning.appeals@wokingham.gov.uk',
		teamId: 9 //West3
	},
	{
		lpaCode: 'D1835',
		name: 'Worcester City Council',
		email: 'planning@worcester.gov.uk',
		teamId: 9 //West3
	}
];
