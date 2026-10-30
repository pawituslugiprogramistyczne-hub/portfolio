import { randomInt } from "crypto"

export type Person = { id: number; partnerId: number | null }
export type Pair = { giverId: number; receiverId: number }

// Who each person may draw: not themselves, not their partner, not anyone from the past draws.
export function allowedReceivers(people: Person[], pastPairs: Pair[]): Map<number, number[]> {
  const allowed = new Map<number, number[]>()
  for (const giver of people) {
    const receivers = people
      .filter(
        (receiver) =>
          receiver.id !== giver.id &&
          receiver.id !== giver.partnerId &&
          receiver.partnerId !== giver.id &&
          !pastPairs.some((pair) => pair.giverId === giver.id && pair.receiverId === receiver.id),
      )
      .map((receiver) => receiver.id)
    allowed.set(giver.id, receivers)
  }
  return allowed
}

// Every complete assignment. Listing them all keeps the pick uniform and proves when none exists;
// the group is small enough for that (8 people means at most 8! = 40320 assignments).
export function validAssignments(people: Person[], pastPairs: Pair[]): Pair[][] {
  const allowed = allowedReceivers(people, pastPairs)
  const assignments: Pair[][] = []
  const pairs: Pair[] = []
  const taken = new Set<number>()

  function assign(index: number) {
    if (index === people.length) {
      assignments.push([...pairs])
      return
    }
    const giverId = people[index].id
    for (const receiverId of allowed.get(giverId) ?? []) {
      if (taken.has(receiverId)) continue
      taken.add(receiverId)
      pairs.push({ giverId, receiverId })
      assign(index + 1)
      pairs.pop()
      taken.delete(receiverId)
    }
  }

  assign(0)
  return assignments
}

// The whole group is drawn at once, so nobody can be left without a valid person, as can happen
// when pulling names from a hat one by one. Returns null when the rules leave no assignment.
export function drawAssignment(people: Person[], pastPairs: Pair[]): Pair[] | null {
  if (people.length < 2) return null
  const assignments = validAssignments(people, pastPairs)
  if (assignments.length === 0) return null
  return assignments[randomInt(assignments.length)]
}
