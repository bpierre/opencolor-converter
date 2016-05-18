/* eslint-env mocha */
import {expect} from 'chai'
import oco from 'opencolor'
import {importer, exporter} from '../src/css'

describe('CSS Converter', () => {
  describe('Importer', () => {
    it('should import one color per ruleset', () => {
      return importer(`body {
  background-color: #F00
      }`).then((tree) => {
        expect(tree.get('body.background-color').hexcolor()).to.equal('#FF0000')
      })
    })
    it('should import more than one color per ruleset', () => {
      return importer(`body {
  background-color: #F00;
  color: #F00
      }`).then((tree) => {
        expect(tree.get('body.background-color').hexcolor()).to.equal('#FF0000')
        expect(tree.get('body.color').hexcolor()).to.equal('#FF0000')
      })
    })
    it('should import more than one rulesets', () => {
      return importer(`body {
  color: #F00
      }
  h1 {
    color: #000000
      }`).then((tree) => {
        expect(tree.get('body.color').hexcolor()).to.equal('#FF0000')
        expect(tree.get('h1.color').hexcolor()).to.equal('#000000')
      })
    })
  })
  describe('Exporter', () => {
    it('should import one color per ruleset', () => {
      const tree = oco.parse(`
color: #F00
`)
      return exporter(tree).then((css) => {
        expect(css).to.contain('--color: #FF0000')
      })
    })
    it('should map properties', () => {
      const tree = oco.parse(`
text: #111111
bg: #222222
fg: #333333
fill: #444444
`)
      return exporter(tree, {cssvariables: false, mapProperties: true})
        .then((css) => {
          expect(css).to.contain('color: #111111')
          expect(css).to.contain('color: #333333')
          expect(css).to.contain('background-color: #222222')
          expect(css).to.contain('background-color: #444444')
        })
    })
  })
})
