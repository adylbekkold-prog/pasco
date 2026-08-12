import { getLocalLabs, getLocalPascoKits } from '@/lib/local-db'
import { siteConfig } from '@/lib/content'

describe('portal branding and seeded catalog data', () => {
  it('uses the new portal name in site config', () => {
    expect(siteConfig.name).toBe('PASCO Lab')
    expect(siteConfig.shortName).toBe('PASCO Lab')
  })

  it('keeps Russian and Kyrgyz laboratory catalogs isolated', async () => {
    const russianLabs = await getLocalLabs({ adminMode: true }, 'ru')
    const kyrgyzLabs = await getLocalLabs({ adminMode: true }, 'ky')
    const russianSlugs = new Set(russianLabs.map((lab) => lab.slug))
    const kyrgyzSlugs = new Set(kyrgyzLabs.map((lab) => lab.slug))
    const sharedSlugs = [...russianSlugs].filter((slug) => kyrgyzSlugs.has(slug))

    expect(kyrgyzLabs.length).toBeGreaterThan(0)
    expect(sharedSlugs).toEqual([])
  })

  it('keeps Kyrgyz PASCO components translated', async () => {
    const [russianKits, kyrgyzKits] = await Promise.all([
      getLocalPascoKits(undefined, 'ru'),
      getLocalPascoKits(undefined, 'ky'),
    ])
    const russianKitsById = new Map(russianKits.map((kit) => [kit.id, kit]))
    const russianComponentsById = new Map(
      russianKits.flatMap((kit) => kit.components ?? []).map((component) => [component.id, component])
    )
    const kyrgyzComponents = kyrgyzKits.flatMap((kit) => kit.components ?? [])
    const untranslatedRussianKits = kyrgyzKits.filter((kit) => {
      const russianKit = russianKitsById.get(kit.id)
      return russianKit && kit.name === russianKit.name && kit.description === russianKit.description
    })
    const untranslatedRussianSeeds = kyrgyzComponents.filter((component) => {
      const russianComponent = russianComponentsById.get(component.id)
      return (
        russianComponent &&
        component.name === russianComponent.name &&
        component.description === russianComponent.description
      )
    })
    const pascoText = [
      ...kyrgyzKits.flatMap((kit) => [kit.name, kit.description]),
      ...kyrgyzComponents.flatMap((component) => [component.name, component.description, component.storage_location]),
    ].filter(Boolean)

    expect(kyrgyzKits.length).toBeGreaterThan(0)
    expect(kyrgyzComponents.length).toBeGreaterThan(0)
    expect(untranslatedRussianKits).toEqual([])
    expect(untranslatedRussianSeeds).toEqual([])
    expect(pascoText.some((text) => /[?]{2,}/.test(text))).toBe(false)
  })
})
