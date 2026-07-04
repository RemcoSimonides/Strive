import { GeocodeService } from './geocode.service'

const photonResponse = {
  features: [
    {
      geometry: { coordinates: [4.89, 52.37] },
      properties: { name: 'Amsterdam', country: 'Netherlands' }
    }
  ]
}

describe('GeocodeService', () => {
  let service: GeocodeService
  let fetchMock: jest.Mock

  beforeEach(() => {
    service = new GeocodeService()
    fetchMock = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(photonResponse) })
    global.fetch = fetchMock
  })

  it('maps photon features to geocode results', async () => {
    const results = await service.search('Amsterdam')
    expect(fetchMock).toHaveBeenCalledWith('https://photon.komoot.io/api/?q=Amsterdam&limit=5')
    expect(results).toEqual([{ lat: 52.37, lng: 4.89, name: 'Amsterdam, Netherlands' }])
  })

  it('reverse geocodes coordinates', async () => {
    const result = await service.reverse(52.37, 4.89)
    expect(fetchMock).toHaveBeenCalledWith('https://photon.komoot.io/reverse?lon=4.89&lat=52.37')
    expect(result).toEqual({ lat: 52.37, lng: 4.89, name: 'Amsterdam, Netherlands' })
  })

  it('returns empty results on http error', async () => {
    fetchMock.mockResolvedValue({ ok: false })
    expect(await service.search('Amsterdam')).toEqual([])
    expect(await service.reverse(52.37, 4.89)).toBeUndefined()
  })

  it('returns empty results on network failure', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    expect(await service.search('Amsterdam')).toEqual([])
    expect(await service.reverse(52.37, 4.89)).toBeUndefined()
  })
})
