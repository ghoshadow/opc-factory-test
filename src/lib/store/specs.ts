import type { Spec } from "@/types/factory"

const specStore = new Map<string, Spec>()

export function getAllSpecs(): Spec[] {
  return Array.from(specStore.values())
}

export function getSpec(id: string): Spec | undefined {
  return specStore.get(id)
}

export function setSpec(id: string, spec: Spec): void {
  specStore.set(id, spec)
}

export function deleteSpec(id: string): boolean {
  return specStore.delete(id)
}
