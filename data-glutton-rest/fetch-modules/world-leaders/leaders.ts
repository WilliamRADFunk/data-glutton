import * as getUuid from 'uuid-by-string';

import { consts } from '../../constants/constants';
import { store } from '../../constants/globalStore';
import { EntityContainer } from '../../models/entity-container';
import { entityMaker } from '../../utils/entity-maker';
import { entityRefMaker } from '../../utils/entity-ref-maker';
import { getRelation } from '../../utils/get-relations';

export function getLeaders(cheerioElem: CheerioSelector, country: string, countryId: string) {
	// Checking to see if country has the section needed before continuing.
    let bailOut = true;
    cheerioElem('#countryOutput').each(() => {
        bailOut = false;
    });
    if (bailOut) {
        return;
	}
	// Some countries have duplicate titles that differentiated by the region they govern.
	// This captures the change so that an ontological note can be added for those specific offices.
	let specificRegion: string;
	cheerioElem('#countryOutput ul li #chiefsOutput > div').each((index: number, element: CheerioElement) => {
		// Capture a region specific header change.
		const regionName = cheerioElem(element).find('strong').text().trim();
		specificRegion = regionName ? regionName : (specificRegion || '');
		if (regionName) {
			specificRegion = specificRegion
				.replace('Admin.', 'Administrative')
				.replace('Govt.', 'Government');
		}
		// Captures names of office and person appointed to that office.
		const personName = cheerioElem(element.lastChild).find('span > span').text().trim();
		const officeName = cheerioElem(element).find('div > span > span').text().trim()
			.replace(personName, '')
			.replace('Min.-Del.', 'Minister-Delegate')
			.replace('Min.-Del', 'Minister-Delegate')
			.replace('Min.', 'Minister')
			.replace('Min. ', 'Minister ')
			.replace('Head, ', 'Head of the ')
			.replace('Min of ', 'Minister of ')
			.replace('Pres.', 'President')
			.replace('President, ', 'President of ')
			.replace('Dep.', 'Deputy')
			.replace('Dir.', 'Director')
			.replace('Fed.', 'Federal')
			.replace('Gen.', 'General')
			.replace('Sec.', 'Secretary')
			.replace('Secretary, ', 'Secretary of ')
			.replace('General, ', 'General of ')
			.replace('Director, ', 'Director of ')
			.replace('Dept.', 'Department')
			.replace('Gov.', 'Governor')
			.replace('Cdr.', 'Commander')
			.replace('Governor, ', 'Governor of the ')
			.replace('Commander, ', 'Commander of the ')
			.replace('Chmn.', 'Chairman')
			.replace('Chairman, ', 'Chairman of ')
			.replace('Premier, ', 'Premier of ')
			.replace('Ctte.', 'Committee')
			.replace('Chief, ', 'Chief of the ')
			.replace('Member, ', 'Member of the ')
			.replace('Admin. ', 'Administrative ')
			.replace('Govt. ', 'Government ')
			.replace(', State Council', ' of the State Council')
			.replace(' SPA ', ' Supreme People\'s Assembly ')
			.replace(' SAC ', ' State Affairs Commission ')
			.replace('Admin.', 'Administration');
		if (!officeName) {
			return;
		}
		// Fetch or create office entity
		const officeId = consts.ONTOLOGY.INST_GOVERNMENT_OFFICE + getUuid.default(country) + '-' + getUuid.default(officeName);
		let govObjectProp: EntityContainer = {};
		if (store.govOffices.find({ '@id': { $eq: officeId } })[0]) {
			govObjectProp[consts.ONTOLOGY.HAS_GOVERNMENT_OFFICE] = store.govOffices.find({ '@id': { $eq: officeId } })[0];
		} else {
			govObjectProp = entityMaker(
				consts.ONTOLOGY.HAS_GOVERNMENT_OFFICE,
				consts.ONTOLOGY.ONT_GOVERNMENT_OFFICE,
				officeId,
				`The Office of ${officeName} (${country})`);
			store.govOffices.insert(govObjectProp[consts.ONTOLOGY.HAS_GOVERNMENT_OFFICE]);
		}
		store.govOffices.find({ '@id': { $eq: officeId } })[0].datatypeProperties[consts.ONTOLOGY.DT_TITLE] = officeName;
		// Only add the region specific ontological note if there was one. Most countries don't have any.
		if (specificRegion) {
			store.govOffices.find({ '@id': { $eq: officeId } })[0].datatypeProperties[consts.ONTOLOGY.DT_REGION_SPECIFIC] = specificRegion;
		}
		const objectProperties = store.govOffices.find({ '@id': { $eq: officeId } })[0].objectProperties;
		const hasCountryRef = getRelation(objectProperties, consts.ONTOLOGY.HAS_COUNTRY);
		if (!hasCountryRef) {
			store.govOffices.find({ '@id': { $eq: officeId } })[0].objectProperties.push(
				entityRefMaker(
					consts.ONTOLOGY.HAS_COUNTRY,
					store.countries,
					countryId
			));
		}
		store.countries.find({ '@id': { $eq: countryId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_GOVERNMENT_OFFICE, govObjectProp));

		// Parse name into first and last based on apparent pattern where last name is always all caps.
		if (personName) {
			const personNameDelimited = personName.trim().split(' ');
			let lastNameIndex = -1;
			const regExp = new RegExp('[A-Z]{2,}');
			personNameDelimited.forEach((val: string, i: number) => {
				const isMatch = val && val.match(regExp);
				if (lastNameIndex === -1 && isMatch) {
					lastNameIndex = i;
				}
			});
			const firstName = personNameDelimited.slice(0, lastNameIndex).join(' ');
			const lastName = personNameDelimited.slice(lastNameIndex).join(' ');

			// If name present fetch or create the associated entity
			const personId = consts.ONTOLOGY.INST_PERSON + getUuid.default(country) + '-' + getUuid.default(personName);
			let perObjectProp: EntityContainer = {};
			if (store.persons.find({ '@id': { $eq: personId } })[0]) {
				perObjectProp[consts.ONTOLOGY.HAS_GOVERNMENT_OFFICIAL] = store.persons.find({ '@id': { $eq: personId } })[0];
			} else {
				perObjectProp = entityMaker(
					consts.ONTOLOGY.HAS_GOVERNMENT_OFFICIAL,
					consts.ONTOLOGY.ONT_PERSON,
					personId,
					`${personName}`);
				store.persons.insert(perObjectProp[consts.ONTOLOGY.HAS_BORDER]);
			}
			perObjectProp[consts.ONTOLOGY.HAS_GOVERNMENT_OFFICIAL].datatypeProperties[consts.ONTOLOGY.DT_NAME] = personName;
			// For cases like Queen ELIZABETH II, dispense with first and last name. Use only name.
			if (lastNameIndex > 0) {
				perObjectProp[consts.ONTOLOGY.HAS_GOVERNMENT_OFFICIAL].datatypeProperties[consts.ONTOLOGY.DT_FIRST_NAME] = firstName;
				perObjectProp[consts.ONTOLOGY.HAS_GOVERNMENT_OFFICIAL].datatypeProperties[consts.ONTOLOGY.DT_LAST_NAME] = lastName;
			}
			perObjectProp[consts.ONTOLOGY.HAS_GOVERNMENT_OFFICIAL].objectProperties.push(
				entityRefMaker(
					consts.ONTOLOGY.HAS_APPOINTED_GOVERNMENT_OFFICE,
					govObjectProp,
					consts.ONTOLOGY.HAS_GOVERNMENT_OFFICE)
			);
			store.govOffices.find({ '@id': { $eq: officeId } })[0].objectProperties.push(entityRefMaker(consts.ONTOLOGY.HAS_GOVERNMENT_OFFICIAL, perObjectProp));
		}		
    });
};