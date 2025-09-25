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
		email: 'planning@cotswold.gov.uk',
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
		email: 'Development.Control@gloucester.gov.uk',
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
	}
];
