import { GoalForm } from './goal.form'
import { createGoal, createAlgoliaGoal, GoalLocation } from '@strive/model'

const location: GoalLocation = { lat: 52.37, lng: 4.89, name: 'Amsterdam, Netherlands' }

describe('GoalForm location', () => {

  it('defaults to null', () => {
    const form = new GoalForm()
    expect(form.location.value).toBeNull()
  })

  it('seeds from goal', () => {
    const form = new GoalForm(createGoal({ location }))
    expect(form.location.value).toEqual(location)
  })

  it('is included in getGoalValue', () => {
    const form = new GoalForm()
    form.location.setValue(location)
    expect(form.getGoalValue().location).toEqual(location)
  })
})

describe('createGoal location', () => {

  it('passes location through', () => {
    expect(createGoal({ location }).location).toEqual(location)
    expect(createGoal().location).toBeUndefined()
  })
})

describe('createAlgoliaGoal geoloc', () => {

  it('derives _geoloc and locationName from a goal with location', () => {
    const algoliaGoal = createAlgoliaGoal(createGoal({ id: '1', location }))
    expect(algoliaGoal._geoloc).toEqual({ lat: location.lat, lng: location.lng })
    expect(algoliaGoal.locationName).toBe(location.name)
  })

  it('is null for a goal without location', () => {
    const algoliaGoal = createAlgoliaGoal(createGoal({ id: '1' }))
    expect(algoliaGoal._geoloc).toBeNull()
    expect(algoliaGoal.locationName).toBeNull()
  })

  it('preserves _geoloc from an algolia hit', () => {
    const hit = createAlgoliaGoal(createGoal({ id: '1', location }))
    const roundTripped = createAlgoliaGoal(hit)
    expect(roundTripped._geoloc).toEqual({ lat: location.lat, lng: location.lng })
    expect(roundTripped.locationName).toBe(location.name)
  })
})
