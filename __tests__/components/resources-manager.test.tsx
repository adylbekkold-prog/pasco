import { fireEvent, render, screen } from '@testing-library/react'
import ResourcesManager from '@/components/ResourcesManager'

function getAddButton() {
  return screen.getAllByRole('button').find((button) => {
    const text = button.textContent ?? ''
    return text.includes('ресурс') || text.includes('РµСЃСѓСЂСЃ')
  })
}

function getHiddenResources(container: HTMLElement) {
  const input = container.querySelector('input[type="hidden"][name="resources"]') as HTMLInputElement | null
  expect(input).not.toBeNull()
  return JSON.parse(input!.value) as Array<Record<string, unknown>>
}

describe('ResourcesManager', () => {
  it('allows a teacher to select and upload a .spklab file', () => {
    const { container } = render(<ResourcesManager labId="lab-1" locale="ru" />)

    fireEvent.click(getAddButton()!)

    const resourceType = container.querySelector('select')
    expect(resourceType).not.toBeNull()

    fireEvent.change(resourceType!, { target: { value: 'worksheet' } })

    expect(container.querySelector('input[type="file"]')?.getAttribute('accept')).toContain('.spklab')
  })

  it('keeps newly added resource data in form state for submit', () => {
    const onChange = jest.fn()
    const { container } = render(
      <ResourcesManager labId="lab-1" resources={[]} onChange={onChange} locale="ru" />
    )

    fireEvent.click(getAddButton()!)
    const resourceType = container.querySelector('select')!
    fireEvent.change(resourceType, { target: { value: 'link' } })

    const titleInput = container.querySelector('input[type="text"]')!
    fireEvent.change(titleInput, { target: { value: 'PASCO guide' } })

    const urlInput = container.querySelector('input[type="url"]')!
    fireEvent.change(urlInput, { target: { value: 'https://example.com/pasco-guide' } })

    const hiddenResources = getHiddenResources(container)
    expect(hiddenResources).toHaveLength(1)
    expect(hiddenResources[0]).toEqual(
      expect.objectContaining({
        resource_type: 'link',
        title: 'PASCO guide',
        url: 'https://example.com/pasco-guide',
      })
    )

    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        lab_id: 'lab-1',
        resource_type: 'link',
        title: 'PASCO guide',
        url: 'https://example.com/pasco-guide',
        sort_order: 0,
      }),
    ])
  })
})
