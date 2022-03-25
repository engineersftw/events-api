const moment = require('moment-timezone')
const { filterEvents, processEvents, createFormattedMessage } = require('./telegram_worker')

describe('createdFormattedMessage', () => {
  const baseEvent = {
    id: 252,
    name: 'STACK-X Meetup: Agile Coaching Methods to Create Great Products as a Team',
    description: '### Complete this [Zoom Registration\nForm](https://us02web.zoom.us/meeting/register/tZcpcuGhrz8pGtT2ngBL0mU9GRc6MiJquG5S)\nto receive the webinar link. For pre-reading materials on this Meetup, head over\nto the Singapore Government Developer Portal via this\n[link](https://www.developer.tech.gov.sg/guidelines/development-and-iteration/enabling-loop-for-solving-complex-problems).\n\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\- In developing products, growing and enabling\ngreat teams is essential. Team coaching enables high value-creation teams to\ndeliver effective solutions. This STACK-X Meetup will equip you with the\nessential key solution conceptualisation mindset and development skillsets to\nsucceed at creating and supporting impactful products and services. Hear about\nthe GovTech Services Agile Coach Team’s signature Agile Coaching approach, that\ncombines the agile way of working and team coaching to help teams creatively\nsolve complex challenges effectively. The team will also share valuable tips\nthat help to jumpstart the building of collaborative team relationships and to\naid in managing of meaningful products and services as well as day-to-day\noperations. This Meetup includes an activity segment facilitated by experienced\ntrainers, where you can practise applying the coaching approach and use the\nfour-step Enabling Loop guide on common use cases. Who should attend: Product\nmanagement leaders and teams; Beginner to Intermediate onwards **Event Rundown**\n10:30am – Welcome by STACK team 10:35am – About the GovTech Services Agile Coach\nTeam By Garret Yap, Deputy Director, GovTech 10:40am – GovTech Services Agile\nCoach Team’s Coaching Approach By Regina Ong, Lead Delivery Manager, Services,\nGovTech 10:55am – Case Study: MOM WINS DevOps Team Agile Coaching Partnership\nand Its Outcomes By Debbie Siah, Delivery Manager, Services, GovTech 11:10am –\nActivity segment: Practise applying the Coaching Approach and Enabling Loop to\nuse cases 11:35am – Q&A segment 11:45am– End of Meetup\n\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\-\\- **About the Speakers** **[Garret\nYap](https://www.linkedin.com/in/garret-yap-mba-pmp-csm-cspo-53a18155/)** Garret\nYap has amassed valuable experience in the last 16 years enabling digital\ntransformations in large organisations, both in the private and public sectors.\nNotably, leveraging and taking his leadership and transformation learnings to\nthe next level at DBS and currently GovTech, where he holds the role of Deputy\nDirector, GovTech, leading a team of Agile Coach and is also a Tribe Lead.\nGarret is not only experienced in introducing and deepening agile practices in\norganisations. Being a seasoned and certified agile practitioner and leader in\nagile coaching, application development and product management, he relates to\nboth teams and leaders, creating impactful partnerships for holistically driving\ntransformations on an organization level. Garret is a strong believer that agile\nworks best for delivering value in complex scenarios - And growing resilient,\nempowered teams is a crucial part of the equation to achieving those valuable\noutcomes. **[Regina Ong](https://www.linkedin.com/in/reginaong/)** Regina Ong is\na practising agile and enterprise coach, in industries such as energy,\nrenewables, marine and offshore and aviation, with market-leading companies such\nas Vestas Manufacturing A/S in Denmark, Lloyd’s Register and Singapore Airlines\nin Singapore. Regina is currently a Lead Delivery Manager, in the GovTech\nServices Agile Coach Team. She has over 15 years in managing enterprise\nportfolios, projects, products, as well as driving and coaching in agile and\ndigital transformations. Regina is also an authorised ICAgile Instructor for\nAgile Coaching, Agile Team Facilitation, Agile Product Ownership and Agile\nFundamentals. As a practising ontological and team coach, she typically uses a\nunique blend of agile and ontological approaches to enable more impactful\nlearnings and jumpstart sustainable habits on individual, team and organisation\nlevels. **[Debbie Siah](https://www.linkedin.com/in/debbie-siah-b4922b11/)**\nDebbie Siah is currently working on driving product delivery and transformation\nas a delivery manager and agile coach in Govtech. She brings with her 17 years\nof experience in various industries such as defence, airline and real estate. Of\nwhich, the most recent 8 years are spent driving agile transformation in the\npublic sector. Debbie specializes in bringing business and IT together,\npartnering at the working team level to build fit-for-purpose products and\nstrong, high value-creation teams. With her hands-on experience in roles like\nSoftware Developer, Business Analyst, Scrum Master, Kanban Service Delivery\nManager, she works with teams on the ground to develop practical solutions to\naddress the real-life issues faced, delivering value to users.',
    location: 'Online event',
    rsvp_count: 122,
    url: 'https://www.meetup.com/dbs-singapore-hack2hire/events/284191539',
    group_id: '32455672',
    group_name: 'STACK-X by GovTech Singapore',
    group_url: 'https://www.meetup.com/STACK-X-by-GovTech-Singapore',
    formatted_time: '23 Mar 2022, Wed, 10:30 am',
    start_time: '2022-03-22T18:30:00.000Z',
    end_time: '2022-03-22T20:00:00.000Z',
    platform: 'meetup',
    latitude: -8.521147,
    longitude: null,
    createdAt: '2022-03-22T12:28:40.246Z',
    updatedAt: '2022-03-22T12:28:40.246Z',
    platform_identifier: '284481382',
    active: true
  }

  it('creates a formatted message from an event', () => {
    const event = { ...baseEvent }
    expect(createFormattedMessage(event)).toEqual(
      `⏰ ${event.formatted_time} - [${event.name}](${event.url}) (${event.group_name}) - 📍${event.location}`
    )
  })

  it('trims event name if there are leading and trailing spaces', () => {
    const expectedEventName = 'unique event name'
    const event = { ...baseEvent, name: '  ' + expectedEventName + '    ' }
    expect(createFormattedMessage(event)).toEqual(
      `⏰ ${event.formatted_time} - [${expectedEventName}](${event.url}) (${event.group_name}) - 📍${event.location}`
    )
  })

  it.each([null, undefined, ''])('should not show location if event location is missing', (location) => {
    const event = { ...baseEvent, location }
    expect(createFormattedMessage(event)).toEqual(
      `⏰ ${event.formatted_time} - [${event.name}](${event.url}) (${event.group_name})`
    )
  })

  it.each([null, undefined, ''])('should show event name as text and not as hyperlink when event url is missing', (url) => {
    const event = { ...baseEvent, url }
    expect(createFormattedMessage(event)).toEqual(
      `⏰ ${event.formatted_time} - ${event.name} (${event.group_name}) - 📍${event.location}`
    )
  })
})

describe('filterEvents', () => {
  it('undesired events should be filtered', () => {
    const events = [
      {
        name: 'a',
        location: 'my house',
        url: 'www.heymyhouse.com',
        group_name: 'Kakis SG Anything Watever Meetup Group',
        group_url: 'www.heymyhouse.com',
        formatted_time: moment().tz('Asia/Singapore').format('h:mm a')
      },
      {
        name: 'b',
        location: 'my other house',
        url: 'www.heymyhouse.com',
        group_name: 'EMF & Wireless Radiation Safety',
        group_url: 'www.heymyhouse.com',
        formatted_time: moment().tz('Asia/Singapore').format('h:mm a')
      }
    ]

    expect(events.filter(filterEvents)).toStrictEqual([])
  })

  it('events should be filtered and deduplicated after processing', () => {
    const now = moment().tz('Asia/Singapore').format('h:mm a')

    const events = [
      {
        name: 'a',
        location: 'my house',
        url: 'www.heymyhouse.com',
        group_name: 'My House Group',
        group_url: 'www.heymyhouse.com',
        formatted_time: now
      },
      {
        name: 'a',
        location: 'my house',
        url: 'www.heymyhouse.com',
        group_name: 'My House Group',
        group_url: 'www.heymyhouse.com',
        formatted_time: now
      },
      {
        name: 'b',
        location: 'my other house',
        url: 'www.heymyhouse.com',
        group_name: 'EMF & Wireless Radiation Safety',
        group_url: 'www.heymyhouse.com',
        formatted_time: now
      }
    ]

    expect(processEvents(events)).toStrictEqual([
      {
        name: 'a',
        location: 'my house',
        url: 'www.heymyhouse.com',
        group_name: 'My House Group',
        group_url: 'www.heymyhouse.com',
        formatted_time: now
      }
    ])
  })
})
