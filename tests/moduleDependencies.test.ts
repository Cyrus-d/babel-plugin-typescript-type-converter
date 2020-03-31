import {
  getModuleDependencies,
  setModuleDependencies,
  getModuleReferences,
  getAllModuleReferences,
} from '../src/utils/moduleDependencies';

describe('moduleDependencies', () => {
  const moduleWithDependencies = 'module-with-dependencies';
  const moduleWithDependencies2 = `${moduleWithDependencies}-2`;
  let dependencies = ['d-1', 'd-2'];

  setModuleDependencies(moduleWithDependencies, dependencies);

  it('should have dependencies and references', () => {
    expect([...getModuleDependencies(moduleWithDependencies)]).toStrictEqual(dependencies);
    expect([...getModuleReferences('d-1')]).toStrictEqual([moduleWithDependencies]);
    expect([...getModuleReferences('d-2')]).toStrictEqual([moduleWithDependencies]);
  });

  it('should remove  references', () => {
    dependencies = dependencies.slice(1);
    setModuleDependencies(moduleWithDependencies, dependencies);
    expect([...getModuleDependencies(moduleWithDependencies)]).toStrictEqual(dependencies);
    expect(getModuleReferences('d-1')).toBeUndefined();
    expect([...getModuleReferences('d-2')]).toStrictEqual([moduleWithDependencies]);
  });

  it('should add new  reference', () => {
    dependencies.push('d-3');
    setModuleDependencies(moduleWithDependencies, dependencies);
    expect([...getModuleDependencies(moduleWithDependencies)]).toStrictEqual(dependencies);
    expect(getModuleReferences('d-1')).toBeUndefined();
    expect([...getModuleReferences('d-2')]).toStrictEqual([moduleWithDependencies]);
    expect([...getModuleReferences('d-3')]).toStrictEqual([moduleWithDependencies]);
  });

  it('should add new module', () => {
    setModuleDependencies(moduleWithDependencies2, dependencies);

    expect([...getModuleDependencies(moduleWithDependencies2)]).toStrictEqual(dependencies);
    expect([...getModuleReferences('d-2')]).toStrictEqual([
      moduleWithDependencies,
      moduleWithDependencies2,
    ]);
    expect([...getModuleReferences('d-3')]).toStrictEqual([
      moduleWithDependencies,
      moduleWithDependencies2,
    ]);
  });

  it('should remove module', () => {
    setModuleDependencies(moduleWithDependencies, []);
    expect(getModuleDependencies(moduleWithDependencies)).toBeUndefined();
    expect([...getModuleReferences('d-2')]).toStrictEqual([moduleWithDependencies2]);
    expect([...getModuleReferences('d-3')]).toStrictEqual([moduleWithDependencies2]);
  });

  it('should remove reference', () => {
    dependencies = dependencies.slice(1);
    setModuleDependencies(moduleWithDependencies2, dependencies);
    expect([...getAllModuleReferences()]).toHaveLength(1);
  });

  it.todo('should change file modified date');
});
