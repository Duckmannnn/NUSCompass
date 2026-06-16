# Milestone 2 UX Design

This folder contains the UX direction and design notes for **NUSCompass Milestone 2**.

Milestone 2 shifts NUSCompass from a Block C indoor-routing proof-of-concept into a more complete destination-first navigation experience for Eusoff Hall.

## Live Prototype

[Open the M2 Figma Prototype](https://www.figma.com/proto/mkPMVYnxJ9ry4xWj6UFesS/Website-prototype?node-id=16-240&p=f&t=UQQ5ds93Pbr8DuiY-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A3)

The prototype is the current source of truth for the intended M2 user flow.

## Prototype Flow

| Step | Screen                 | Purpose                                                           |
| ---: | ---------------------- | ----------------------------------------------------------------- |
|    1 | Campus overview        | Let users search for rooms or places in Eusoff Hall.              |
|    2 | Block information card | Let users inspect a selected block before opening the indoor map. |
|    3 | Block C floor view     | Reuse the existing Block C indoor map from M1.                    |
|    4 | Room detail card       | Show room-level information and navigation actions.               |
|    5 | Optional guide setup   | Let users choose a starting point only when they need directions. |
|    6 | Route overview         | Preview the route before starting step-by-step navigation.        |
|    7 | Step guide             | Guide users through the route with contextual map switching.      |

## Design Principle

M2 separates two different user needs:

```txt
Where is this place?
→ destination only

How do I get there?
→ starting point + destination
```

This is why M2 uses a destination-first flow. Users should be able to inspect a place first, then choose guided navigation only if they need it.

## Related Documents

* [Design notes](./design-notes.md)
* PDF snapshot: `nuscompass-m2-ux-prototype.pdf` can be added later if we want a stable archived version of the prototype.
