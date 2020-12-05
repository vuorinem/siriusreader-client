import { TextUtility } from './text-utility';
import { autoinject } from 'aurelia-framework';
import { computedFrom } from 'aurelia-framework';
import { SectionModel } from '../book/section-model';
import { DomUtility } from './dom-utility';

@autoinject
export class ReadingState {
  private currentStartSection?: SectionModel;
  private currentView?: ClientRect | DOMRect;
  private currentViewOffset: number = 0;
  private currentRange: Range;
  private startRange: Range;
  private currentText: string = "";
  private textFromStart: string = "";

  @computedFrom('currentView')
  public get view(): ClientRect | DOMRect | undefined {
    return this.currentView;
  }

  @computedFrom('currentText')
  public get characterCount(): number {
    return this.textUtility.calculateVisibleCharacters(this.currentText);
  }

  @computedFrom('currentText')
  public get wordCount(): number {
    return this.textUtility.calculateWords(this.currentText);
  }

  @computedFrom('currentText')
  public get text(): string {
    return this.currentText;
  }

  @computedFrom('currentStartSection')
  public get section(): SectionModel | undefined {
    return this.currentStartSection;
  }

  @computedFrom('currentStartSection', 'textFromStart')
  public get startLocation(): number {
    if (!this.currentStartSection) {
      return 0;
    }

    const sectionLocation = this.textUtility.calculateVisibleCharacters(this.textFromStart);

    return this.currentStartSection.startLocation + sectionLocation;
  }

  @computedFrom('currentSection')
  public get sectionCharacterCount(): number {
    if (!this.currentStartSection) {
      return 0;
    }

    const range = document.createRange();
    range.selectNode(this.currentStartSection.element);

    return this.textUtility.calculateVisibleCharacters(range.toString());
  }

  @computedFrom('section.pageWidth', 'currentViewOffset')
  public get currentPage(): number {
    if (!this.section || !this.section.pageWidth) {
      return 0;
    }

    return Math.ceil(this.currentViewOffset / this.section.pageWidth) + 1;
  }

  @computedFrom('section.pageCount')
  public get sectionPageCount(): number {
    if (!this.section) {
      return 0;
    }

    return this.section.pageCount;
  }

  constructor(
    private textUtility: TextUtility,
    private domUtility: DomUtility,
  ) {
    this.currentRange = document.createRange();
    this.startRange = document.createRange();
  }

  public setCurrentView(view: ClientRect | DOMRect, offset: number, sections: SectionModel[]) {
    this.currentView = view;
    this.currentViewOffset = offset;

    const startRange = document.createRange();
    const endRange = document.createRange();
    let startNode: Node | null = null;
    let hasEnd = false;

    for (const section of sections) {
      if (section.element.childElementCount === 0) {
        continue;
      }

      const firstLeft = this.getLeft(section.element);
      const lastRight = this.getRight(section.element);

      if (firstLeft === null || lastRight === null ||
        firstLeft > view.right || lastRight < view.left) {
        // Section is not in the current view
        continue;
      }

      if (!startNode) {
        this.currentStartSection = section;
        startNode = this.findStartNodeAndOffset(startRange, view, section.element.firstChild!);
      }

      if (!hasEnd && startNode) {
        hasEnd = this.findEndNodeAndOffset(endRange, view, startNode, section.element);
      }
    }

    this.currentRange.setStart(startRange.startContainer, startRange.startOffset);
    this.currentRange.setEnd(endRange.endContainer, endRange.endOffset);
    this.currentText = this.currentRange.toString();

    if (this.currentStartSection && this.currentStartSection.element) {
      this.startRange.setStart(this.currentStartSection.element, 0);
      this.startRange.setEnd(startRange.startContainer, startRange.startOffset);
      this.textFromStart = this.startRange.toString();
    }
  }

  public getLocation(node: Node, offset: number): number | null {
    if (!this.currentStartSection) {
      return null;
    }

    const range = document.createRange();
    range.setStart(this.currentStartSection.element, 0);
    range.setEnd(node, offset);

    const textFromStart = range.toString();

    return this.textUtility.calculateVisibleCharacters(textFromStart)
      + this.currentStartSection.startLocation;
  }

  private findStartNodeAndOffset(range: Range, view: ClientRect, node: Node): Node | null {
    let right = this.getRight(node);

    let currentNode: Node | null = node;

    // Skip nodes that are not in the view
    while (right === null || right < view.left) {
      currentNode = currentNode.nextSibling

      if (!currentNode) {
        return null;
      }

      right = this.getRight(currentNode);
    }

    if (currentNode.hasChildNodes()) {
      const selectedNode = this.findStartNodeAndOffset(range, view, currentNode.firstChild!);

      if (selectedNode) {
        // Return the found child node
        return selectedNode;
      }
    }

    if (!(currentNode instanceof CharacterData)) {
      // Cannot set more accurate location, so just use the node start
      range.selectNode(currentNode);

      return currentNode;
    }

    range.setEnd(currentNode, currentNode.length);
    for (let i = 0; i < currentNode.length; i++) {
      range.setStart(currentNode, i);

      if (range.getBoundingClientRect().left >= view.left) {
        break;
      }
    }

    return currentNode;
  }

  private findEndNodeAndOffset(range: Range, view: ClientRect | DOMRect, node: Node,
    rootNode: Node): boolean {

    let right = this.getRight(node);

    let currentNode: Node | null = node;
    let previousNodeWithContent: Node | null = null;

    // Skip nodes that are entirely in the view
    while (right === null || right < view.right) {
      if (right !== null) {
        previousNodeWithContent = currentNode;
      }

      currentNode = currentNode.nextSibling;

      if (!currentNode) {
        // Reached the end of the element
        if (node.parentNode === rootNode) {
          // Cannot go higher up, use the previous node with content
          currentNode = previousNodeWithContent;
          break;
        } else if (node.parentNode !== null) {
          // Traverse up and try to find sibling from parent node
          return this.findEndNodeAndOffset(range, view, node.parentNode, rootNode);
        } else {
          // Reached the top, could not find end node
          return false;
        }
      }

      right = this.getRight(currentNode);
    }

    if (currentNode === null) {
      return false;
    }

    const left = this.getLeft(currentNode);

    if (left !== null && left > view.right) {
      // Current node is entirely past the view, use previous node
      currentNode = previousNodeWithContent;

      if (!currentNode) {
        if (node.parentNode === null) {
          return false;
        }

        // End not found within this node, check parent node
        return this.findEndNodeAndOffset(range, view, node.parentNode, rootNode);
      }
    }

    if (currentNode.hasChildNodes()) {
      // Find end from the child elements of this node
      return this.findEndNodeAndOffset(range, view, currentNode.firstChild!, currentNode);
    }

    if (!(currentNode instanceof CharacterData)) {
      // Cannot set more accurate location, so just use the whole node
      range.selectNode(currentNode);

      return true;
    }

    // Check if node ends in the view
    range.selectNode(currentNode);
    let rangeRight = range.getBoundingClientRect().right;
    if (rangeRight < view.right) {
      return true;
    }

    range.setStart(currentNode, 0);

    // Binary search to find the location that has the last one visible in the view
    let leftIndex = 0;
    let rightIndex = currentNode.length;

    while (leftIndex < rightIndex - 1) {
      const middleIndex = Math.floor((leftIndex + rightIndex) / 2);

      range.setEnd(currentNode, middleIndex);
      rangeRight = range.getBoundingClientRect().right;

      if (rangeRight < view.right) {
        leftIndex = middleIndex;
      } else {
        rightIndex = middleIndex;
      }
    }

    range.setEnd(currentNode, leftIndex);

    return true;
  }

  private getLeft(node: Node): number | null {
    if (node instanceof Element) {
      let child: Node | null = node.firstChild;

      while (child) {
        let right = this.getLeft(child);
        if (right !== null) {
          return right;
        }

        child = child.nextSibling;
      }
    } else if (node instanceof CharacterData) {
      const rect = this.getRect(node);

      if (rect.width !== 0) {
        return rect.left;
      }
    }

    return null;
  }

  private getRight(node: Node): number | null {
    if (node instanceof Element) {
      let child: Node | null = node.lastChild;

      while (child) {
        let right = this.getRight(child);
        if (right !== null) {
          return right;
        }

        child = child.previousSibling;
      }
    } else if (node instanceof CharacterData) {
      const rect = this.getRect(node);

      if (rect.width !== 0) {
        return rect.right;
      }
    }

    return null;
  }

  private getRect(node: CharacterData) {
    const range = document.createRange();

    range.setStart(node, 0);
    range.setEnd(node, node.length);

    return range.getBoundingClientRect();
  }

}
