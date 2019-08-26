const MeetupHarvester = require('./harvesters/meetup_harvester')

class HarvesterService {
  constructor (options = {}) {
    this.meetup = options.meetup
  }

  async prepareService () {
    try {
      this.meetupHarvester = new MeetupHarvester(this.meetup)
      await this.meetupHarvester.prepareService()
    } catch (err) {
      console.log('Prepare Service Error', err)
    }
  }

  async fetchGroups () {
    const allGroups = []

    try {
      const meetupGroups = await this.meetupHarvester.fetchGroups()

      allGroups.push(...meetupGroups)
    } catch (err) {
      console.log('Harvester Error', err)
    }

    return allGroups
  }

  async fetchGroupEvents (group) {
    const allGroupEvents = []

    try {
      const meetupGroupEvents = await this.meetupHarvester.fetchGroupEvents(group)

      allGroupEvents.push(...meetupGroupEvents)
    } catch (err) {
      console.log('Harvester Error', err)
    }

    return allGroupEvents
  }
}

module.exports = HarvesterService
