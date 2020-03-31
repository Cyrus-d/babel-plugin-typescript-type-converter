import {
  getModuleDependencies,
  setModuleDependencies,
  getModuleReferences,
  getAllModuleReferences,
} from '../src/utils/moduleDependencies';

describe('moduleDependencies', () => {
  const moduleWithDependencies = 'module-with-dependencies';
  const moduleWithDependencies_2 = moduleWithDependencies + '-2';
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
    expect(getModuleReferences('d-1')).toStrictEqual(undefined);
    expect([...getModuleReferences('d-2')]).toStrictEqual([moduleWithDependencies]);
  });

  it('should add new  reference', () => {
    dependencies.push('d-3');
    setModuleDependencies(moduleWithDependencies, dependencies);
    expect([...getModuleDependencies(moduleWithDependencies)]).toStrictEqual(dependencies);
    expect(getModuleReferences('d-1')).toStrictEqual(undefined);
    expect([...getModuleReferences('d-2')]).toStrictEqual([moduleWithDependencies]);
    expect([...getModuleReferences('d-3')]).toStrictEqual([moduleWithDependencies]);
  });

  it('should add new module', () => {
    setModuleDependencies(moduleWithDependencies_2, dependencies);

    expect([...getModuleDependencies(moduleWithDependencies_2)]).toStrictEqual(dependencies);
    expect([...getModuleReferences('d-2')]).toStrictEqual([
      moduleWithDependencies,
      moduleWithDependencies_2,
    ]);
    expect([...getModuleReferences('d-3')]).toStrictEqual([
      moduleWithDependencies,
      moduleWithDependencies_2,
    ]);
  });

  it('should remove module', () => {
    setModuleDependencies(moduleWithDependencies, []);
    expect(getModuleDependencies(moduleWithDependencies)).toStrictEqual(undefined);
    expect([...getModuleReferences('d-2')]).toStrictEqual([moduleWithDependencies_2]);
    expect([...getModuleReferences('d-3')]).toStrictEqual([moduleWithDependencies_2]);
  });

  it('should remove reference', () => {
    dependencies = dependencies.slice(1);
    setModuleDependencies(moduleWithDependencies_2, dependencies);
    expect([...getAllModuleReferences()]).toHaveLength(1);
  });
});
