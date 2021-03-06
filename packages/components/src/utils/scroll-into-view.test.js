/* eslint-env jest */
/* eslint-disable no-unused-expressions */
/**
Copyright 2016 Autodesk,Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import { expect } from 'chai';

const scrollIntoView = require('./scroll-into-view.js');

describe('Utils.scrollIntoView', () => {
  let element;

  describe('when the child is fully in view', () => {
    beforeEach(() => {
      element = {
        offsetTop: 10,
        offsetHeight: 10,
        parentElement: {
          scrollTop: 0,
          clientHeight: 100
        }
      };
    });

    it('does nothing', () => {
      scrollIntoView(element);
      expect(element.parentElement.scrollTop).to.eq(0);
    });
  });

  describe('when the child is above the scroll view', () => {
    beforeEach(() => {
      element = {
        offsetTop: 10,
        offsetHeight: 10,
        parentElement: {
          scrollTop: 50,
          clientHeight: 100
        }
      };
    });

    it('scrolls to position the child at the top', () => {
      scrollIntoView(element);
      expect(element.parentElement.scrollTop).to.eq(10);
    });
  });

  describe('when the child is below the scroll view', () => {
    beforeEach(() => {
      element = {
        offsetTop: 120,
        offsetHeight: 10,
        parentElement: {
          scrollTop: 110,
          clientHeight: 100
        }
      };
    });

    it('scrolls to position the child at the bottom', () => {
      scrollIntoView(element);
      expect(element.parentElement.scrollTop).to.eq(110);
    });
  });

  describe('when the element has no parent', () => {
    it('does not raise an error', () => {
      function scrollOrphan() {
        element = {
          parentElement: null
        };
        scrollIntoView(element);
      }
      expect(scrollOrphan).not.to.throw(Error);
    });
  });
});
