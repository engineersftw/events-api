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
    const allGroups = {
      meetup: []
    }

    try {
      const meetupGroups = await this.meetupHarvester.fetchGroups()

      allGroups.meetup.push(...meetupGroups)
    } catch (err) {
      console.log('Harvester Error', err)
    }

    return allGroups
  }

  async fetchGroupEvents (group) {
    let allGroupEvents = []

    try {
      switch(group.platform) {
        case 'meetup':
          const meetupGroupEvents = await this.meetupHarvester.fetchGroupEvents(group)
          allGroupEvents.push(...meetupGroupEvents)
          break
      }
    } catch (err) {
      console.log('Harvester Error', err)
    }

    return {
      group: group,
      events: allGroupEvents
    }
  }
}

module.exports = HarvesterService
