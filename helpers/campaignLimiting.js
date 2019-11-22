const BN = require('bn.js')
const db = require('../db')

async function getCampaignsEarningFrom (query) {
	const campaignsCol = db.getMongo().collection('campaigns')
	const mongoQueryKey = `status.lastApprovedBalances.${query.limitForPublisher}`
	const mongoQuery = {
		[mongoQueryKey]: {
			'$exists': true
		}
	}
	return campaignsCol
		.find(mongoQuery)
		.toArray()
		.then((campaigns) => {
			return campaigns
		})
}

async function filterCampaignsForPublisher (campaigns, limit, query) {
	const campaignsEarningFrom = await getCampaignsEarningFrom(query)
	const { limitForPublisher } = query
	if (campaignsEarningFrom.length > limit) {
		// Sorting to get those with highest earning first if limit is exceeded
		const filtered = campaignsEarningFrom.sort((c1, c2) => {
			const c1Balance = new BN(c1.status.lastApprovedBalances[limitForPublisher])
			const c2Balance = new BN(c2.status.lastApprovedBalances[limitForPublisher])
			return c1Balance.gte(c2Balance) ? -1 : 1
		}).splice(0, limit)
		return filtered
	}
	return campaigns
}

module.exports = { filterCampaignsForPublisher }