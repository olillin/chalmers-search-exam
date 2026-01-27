{
  lib,
  buildNpmPackage,
  fetchFromGitHub,
}:
buildNpmPackage (finalAttrs: {
  pname = "chalmers-search-exam";
  version = "1.0.0";

  src = fetchFromGitHub {
    owner = "olillin";
    repo = "chalmers-search-exam";
    tag = "v${finalAttrs.version}";
    hash = "";
  };

  npmDepsHash = "";

  meta = {
    description = "Search exam dates at Chalmers";
    homepage = "https://github.com/olillin/chalmers-search-exam";
    license = lib.licenses.mit;
    maintainers = with lib.maintainers; [olillin];
  };
})
